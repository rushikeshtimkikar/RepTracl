import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { colors } from '@/constants/Colors';
import { defaultProfile } from '@/data/defaults';
import { loadStored, saveStored, storageKeys } from '@/services/storage';

export type ThemeColorKey = 'accent' | 'background' | 'surface' | 'text';
export type HomeWidgetKey = 'weekly-schedule' | 'streak' | 'quick-actions';

export interface ThemePreferences {
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface WidgetPreferences {
  visible: Record<HomeWidgetKey, boolean>;
  order: HomeWidgetKey[];
}

const defaultTheme: ThemePreferences = {
  accent: colors.lime,
  background: colors.background,
  surface: colors.surface,
  text: colors.text,
  textMuted: colors.textMuted,
};

const defaultWidgets: WidgetPreferences = {
  visible: {
    'weekly-schedule': true,
    streak: true,
    'quick-actions': true,
  },
  order: ['weekly-schedule', 'streak', 'quick-actions'],
};

interface PreferencesContextValue {
  theme: ThemePreferences;
  widgets: WidgetPreferences;
  profileName: string;
  isLoading: boolean;
  updateThemeColor: (key: ThemeColorKey, value: string) => void;
  resetTheme: () => void;
  updateWidgets: (preferences: WidgetPreferences) => void;
  updateProfileName: (name: string) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState(defaultTheme);
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [profileName, setProfileName] = useState(defaultProfile.name);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadStored<ThemePreferences>(storageKeys.theme, defaultTheme),
      loadStored<WidgetPreferences>(storageKeys.homeWidgets, defaultWidgets),
      loadStored<string>(storageKeys.profile, defaultProfile.name),
    ]).then(([storedTheme, storedWidgets, storedProfileName]) => {
      setTheme({ ...defaultTheme, ...storedTheme });
      setWidgets({
        ...defaultWidgets,
        ...storedWidgets,
        visible: { ...defaultWidgets.visible, ...storedWidgets.visible },
      });
      setProfileName(storedProfileName || defaultProfile.name);
    }).catch(() => {
      Alert.alert('Could not load preferences', 'Your default profile and layout are still available.');
    }).finally(() => setIsLoading(false));
  }, []);

  function updateThemeColor(key: ThemeColorKey, value: string) {
    const nextTheme = { ...theme, [key]: value };
    setTheme(nextTheme);
    void saveStored(storageKeys.theme, nextTheme).catch(() => {
      Alert.alert('Could not save theme', 'Your color change could not be saved.');
    });
  }

  function resetTheme() {
    setTheme(defaultTheme);
    void saveStored(storageKeys.theme, defaultTheme).catch(() => {
      Alert.alert('Could not reset theme', 'Your original colors could not be restored.');
    });
  }

  function updateWidgets(nextWidgets: WidgetPreferences) {
    setWidgets(nextWidgets);
    void saveStored(storageKeys.homeWidgets, nextWidgets).catch(() => {
      Alert.alert('Could not save layout', 'Your home layout change could not be saved.');
    });
  }

  function updateProfileName(name: string) {
    setProfileName(name);
    void saveStored(storageKeys.profile, name).catch(() => {
      Alert.alert('Could not save profile', 'Your name change could not be saved.');
    });
  }

  const value = useMemo(
    () => ({ theme, widgets, profileName, isLoading, updateThemeColor, resetTheme, updateWidgets, updateProfileName }),
    [theme, widgets, profileName, isLoading],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider');
  return value;
}
