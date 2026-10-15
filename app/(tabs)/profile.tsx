import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Screen, SectionTitle } from '@/components/Ui';
import { colors, radii, spacing } from '@/constants/Colors';
import { HomeWidgetKey, ThemeColorKey, usePreferences } from '@/contexts/PreferencesContext';
import { defaultProfile } from '@/data/defaults';

const colorTargets: { key: ThemeColorKey; label: string }[] = [
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Cards' },
  { key: 'text', label: 'Text' },
];

const wheelColors = [
  '#FF595E', '#FF924C', '#FFCA3A', '#B8DE6F', '#8AC926', '#52B788',
  '#2EC4B6', '#20A4F3', '#4361EE', '#7209B7', '#B5179E', '#F72585',
];

const widgetLabels: Record<HomeWidgetKey, string> = {
  'weekly-schedule': 'Weekly schedule',
  streak: 'Streak',
  'quick-actions': 'Quick actions',
};

function ColorWheel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.wheel}>
      {wheelColors.map((color, index) => {
        const angle = (index / wheelColors.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <Pressable
            key={color}
            accessibilityLabel={`Choose ${color}`}
            onPress={() => onChange(color)}
            style={[
              styles.wheelSwatch,
              {
                backgroundColor: color,
                left: 100 + Math.cos(angle) * 76 - 17,
                top: 100 + Math.sin(angle) * 76 - 17,
                borderColor: value.toLowerCase() === color.toLowerCase() ? colors.white : 'transparent',
              },
            ]}
          />
        );
      })}
      <View style={[styles.wheelCenter, { backgroundColor: value }]}>
        <Text style={styles.wheelCenterText}>COLOR</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { theme, widgets, profileName, updateThemeColor, updateWidgets, updateProfileName } = usePreferences();
  const [selectedColor, setSelectedColor] = useState<ThemeColorKey>('accent');

  const selectedColorValue = theme[selectedColor];
  const orderedWidgets = useMemo(() => widgets.order, [widgets.order]);

  function moveWidget(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedWidgets.length) return;
    const nextOrder = [...orderedWidgets];
    [nextOrder[index], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[index]];
    updateWidgets({ ...widgets, order: nextOrder });
  }

  function toggleWidget(key: HomeWidgetKey) {
    updateWidgets({ ...widgets, visible: { ...widgets.visible, [key]: !widgets.visible[key] } });
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}><Text style={styles.avatarText}>{profileName[0]?.toUpperCase() ?? 'A'}</Text></View>
          <View style={styles.profileInfo}>
            <TextInput value={profileName} onChangeText={updateProfileName} style={styles.nameInput} placeholder="Your name" placeholderTextColor={colors.textFaint} />
            <Text style={styles.subtitle}>Metric units · Local profile</Text>
          </View>
        </Card>

        <SectionTitle title="Appearance" />
        <Card>
          <Text style={styles.settingText}>Choose a color, then tap the wheel to update it.</Text>
          <View style={styles.colorTargets}>
            {colorTargets.map((target) => (
              <Pressable key={target.key} onPress={() => setSelectedColor(target.key)} style={[styles.colorTarget, selectedColor === target.key && styles.selectedColorTarget]}>
                <View style={[styles.colorDot, { backgroundColor: theme[target.key] }]} />
                <Text style={styles.colorTargetText}>{target.label}</Text>
              </Pressable>
            ))}
          </View>
          <ColorWheel value={selectedColorValue} onChange={(value) => updateThemeColor(selectedColor, value)} />
          <Text style={styles.hexValue}>{selectedColorValue.toUpperCase()}</Text>
        </Card>

        <SectionTitle title="Home layout" />
        <Card>
          <Text style={styles.settingText}>The greeting and today&apos;s session always stay visible.</Text>
          {orderedWidgets.map((key, index) => (
            <View key={key} style={styles.widgetRow}>
              <Pressable onPress={() => toggleWidget(key)} style={[styles.visibilityButton, widgets.visible[key] && styles.visibleButton]}>
                <Text style={[styles.visibilityText, widgets.visible[key] && styles.visibleText]}>{widgets.visible[key] ? 'Shown' : 'Hidden'}</Text>
              </Pressable>
              <Text style={styles.widgetName}>{widgetLabels[key]}</Text>
              <Pressable disabled={index === 0} onPress={() => moveWidget(index, -1)} style={styles.orderButton}><Text style={styles.orderText}>↑</Text></Pressable>
              <Pressable disabled={index === orderedWidgets.length - 1} onPress={() => moveWidget(index, 1)} style={styles.orderButton}><Text style={styles.orderText}>↓</Text></Pressable>
            </View>
          ))}
        </Card>

        <SectionTitle title="Your targets" />
        <View style={styles.statsRow}>
          <Card style={styles.stat}><Text style={styles.label}>BODY WEIGHT</Text><Text style={styles.value}>{defaultProfile.bodyWeightKg} kg</Text></Card>
          <Card style={styles.stat}><Text style={styles.label}>CALORIES</Text><Text style={styles.value}>{defaultProfile.calorieTarget}</Text></Card>
        </View>
        <Card style={styles.setting}><Text style={styles.settingTitle}>Data & privacy</Text><Text style={styles.settingText}>Your preferences stay on this device.</Text></Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 32 },
  eyebrow: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.sm },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 5, marginBottom: spacing.lg },
  profileCard: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  avatar: { alignItems: 'center', borderRadius: 30, height: 60, justifyContent: 'center', width: 60 },
  avatarText: { color: colors.background, fontSize: 22, fontWeight: '800' },
  profileInfo: { flex: 1 },
  nameInput: { color: colors.text, fontSize: 20, fontWeight: '800', padding: 0 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  colorTargets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  colorTarget: { alignItems: 'center', borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 9, paddingVertical: 7 },
  selectedColorTarget: { borderColor: colors.lime },
  colorDot: { borderRadius: 6, height: 12, width: 12 },
  colorTargetText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  wheel: { alignSelf: 'center', height: 200, marginVertical: spacing.md, position: 'relative', width: 200 },
  wheelSwatch: { borderRadius: 17, borderWidth: 3, height: 34, position: 'absolute', width: 34 },
  wheelCenter: { alignItems: 'center', borderColor: colors.background, borderRadius: 37, borderWidth: 4, height: 74, justifyContent: 'center', left: 63, position: 'absolute', top: 63, width: 74 },
  wheelCenterText: { color: colors.background, fontSize: 9, fontWeight: '900' },
  hexValue: { color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  settingText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  widgetRow: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm },
  visibilityButton: { borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6 },
  visibleButton: { backgroundColor: colors.lime, borderColor: colors.lime },
  visibilityText: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },
  visibleText: { color: colors.background },
  widgetName: { color: colors.text, flex: 1, fontSize: 13, fontWeight: '700' },
  orderButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, height: 30, justifyContent: 'center', width: 30 },
  orderText: { color: colors.lime, fontSize: 15, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stat: { flex: 1 },
  label: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  value: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 8 },
  setting: { marginBottom: spacing.md },
  settingTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
});
