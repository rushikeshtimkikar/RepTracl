import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

const wheelColors = ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080', '#FF0000'];

const widgetLabels: Record<HomeWidgetKey, string> = {
  'weekly-schedule': 'Weekly schedule',
  streak: 'Streak',
  'quick-actions': 'Quick actions',
};

function isHexColor(value: string) {
  return /^#[0-9A-F]{6}$/i.test(value);
}

function polarPoint(angle: number, radius: number) {
  const radians = (angle - 90) * (Math.PI / 180);
  return { x: 140 + radius * Math.cos(radians), y: 140 + radius * Math.sin(radians) };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarPoint(startAngle, 116);
  const end = polarPoint(endAngle, 116);
  const innerEnd = polarPoint(endAngle, 88);
  const innerStart = polarPoint(startAngle, 88);
  return `M ${start.x} ${start.y} A 116 116 0 0 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A 88 88 0 0 0 ${innerStart.x} ${innerStart.y} Z`;
}

function hsvToHex(hue: number, saturation: number, value: number) {
  const chroma = value * saturation;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const [red, green, blue] = segment < 1 ? [chroma, x, 0] : segment < 2 ? [x, chroma, 0] : segment < 3 ? [0, chroma, x] : segment < 4 ? [0, x, chroma] : segment < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const match = value - chroma;
  return `#${[red + match, green + match, blue + match].map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;
}

function hexToHsv(hex: string) {
  const channels = hex.replace('#', '').match(/.{2}/g)?.map((channel) => parseInt(channel, 16) / 255) ?? [0, 0, 0];
  const [red, green, blue] = channels;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  return { hue: hue < 0 ? hue + 360 : hue, saturation: max ? delta / max : 0, value: max };
}

function ColorWheel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const hsv = hexToHsv(value);
  const [hue, setHue] = useState(hsv.hue);
  const [saturation, setSaturation] = useState(hsv.saturation);
  const [brightness, setBrightness] = useState(hsv.value);
  const hueRef = useRef(hsv.hue);
  const saturationRef = useRef(hsv.saturation);
  const brightnessRef = useRef(hsv.value);

  useEffect(() => {
    const next = hexToHsv(value);
    setHue(next.hue);
    setSaturation(next.saturation);
    setBrightness(next.value);
    hueRef.current = next.hue;
    saturationRef.current = next.saturation;
    brightnessRef.current = next.value;
  }, [value]);

  function updateHue(x: number, y: number) {
    const angle = (Math.atan2(y - 140, x - 140) * 180) / Math.PI + 90;
    const nextHue = (angle + 360) % 360;
    const nextSaturation = saturationRef.current < 0.1 ? 0.8 : saturationRef.current;
    const nextBrightness = brightnessRef.current < 0.15 ? 0.8 : brightnessRef.current;
    hueRef.current = nextHue;
    saturationRef.current = nextSaturation;
    brightnessRef.current = nextBrightness;
    setHue(nextHue);
    setSaturation(nextSaturation);
    setBrightness(nextBrightness);
    onChange(hsvToHex(nextHue, nextSaturation, nextBrightness));
  }

  function updateSquare(x: number, y: number) {
    const nextSaturation = Math.max(0, Math.min(1, x / 150));
    const nextBrightness = Math.max(0, Math.min(1, 1 - y / 150));
    saturationRef.current = nextSaturation;
    brightnessRef.current = nextBrightness;
    setSaturation(nextSaturation);
    setBrightness(nextBrightness);
    onChange(hsvToHex(hueRef.current, nextSaturation, nextBrightness));
  }

  const hueResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => updateHue(event.nativeEvent.locationX, event.nativeEvent.locationY),
    onPanResponderMove: (event) => updateHue(event.nativeEvent.locationX, event.nativeEvent.locationY),
  })).current;
  const squareResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => updateSquare(event.nativeEvent.locationX, event.nativeEvent.locationY),
    onPanResponderMove: (event) => updateSquare(event.nativeEvent.locationX, event.nativeEvent.locationY),
  })).current;
  const marker = polarPoint(hue, 102);

  return (
    <View style={styles.wheel}>
      <View {...hueResponder.panHandlers} style={StyleSheet.absoluteFill}>
        <Svg height={280} viewBox="0 0 280 280" width={280}>
          {wheelColors.slice(0, -1).map((color, index) => <Path key={color} d={arcPath(index * 30, (index + 1) * 30 + 1)} fill={color} />)}
        </Svg>
        <View style={[styles.hueMarker, { left: marker.x - 17, top: marker.y - 17 }]} />
      </View>
      <View {...squareResponder.panHandlers} style={styles.squareTouchArea}>
        <View style={[styles.squareHue, { backgroundColor: hsvToHex(hue, 1, 1) }]} />
        <LinearGradient colors={['#FFFFFF', 'transparent']} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={styles.squareWhite} />
        <LinearGradient colors={['transparent', '#000000']} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.squareBlack} />
        <View style={[styles.squareMarker, { left: saturation * 150 - 8, top: (1 - brightness) * 150 - 8 }]} />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { theme, widgets, profileName, updateThemeColor, resetTheme, updateWidgets, updateProfileName } = usePreferences();
  const [selectedColor, setSelectedColor] = useState<ThemeColorKey>('accent');
  const [hexDraft, setHexDraft] = useState(theme.accent);

  const selectedColorValue = theme[selectedColor];
  const orderedWidgets = useMemo(() => widgets.order, [widgets.order]);

  useEffect(() => {
    setHexDraft(selectedColorValue.toUpperCase());
  }, [selectedColorValue]);

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
        <Text style={[styles.eyebrow, { color: theme.accent }]}>ACCOUNT</Text>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}><Text style={styles.avatarText}>{profileName[0]?.toUpperCase() ?? 'A'}</Text></View>
          <View style={styles.profileInfo}>
            <TextInput value={profileName} onChangeText={updateProfileName} style={[styles.nameInput, { color: theme.text }]} placeholder="Your name" placeholderTextColor={colors.textFaint} />
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Metric units · Local profile</Text>
          </View>
        </Card>

        <SectionTitle title="Appearance" />
        <Card>
          <Text style={[styles.settingText, { color: theme.textMuted }]}>Tap the ring for a hue, then use the square for saturation and brightness.</Text>
          <View style={styles.colorTargets}>
            {colorTargets.map((target) => (
              <Pressable key={target.key} onPress={() => setSelectedColor(target.key)} style={[styles.colorTarget, { borderColor: theme.background }, selectedColor === target.key && { borderColor: theme.accent }]}>
                <View style={[styles.colorDot, { backgroundColor: theme[target.key] }]} />
                <Text style={styles.colorTargetText}>{target.label}</Text>
              </Pressable>
            ))}
          </View>
          <ColorWheel value={selectedColorValue} onChange={(value) => updateThemeColor(selectedColor, value)} />
          <View style={styles.hexRow}>
            <Text style={[styles.hexLabel, { color: theme.textMuted }]}>HEX</Text>
            <TextInput
              autoCapitalize="characters"
              maxLength={7}
              onChangeText={(value) => {
                const nextValue = value.startsWith('#') ? value : `#${value}`;
                setHexDraft(nextValue.toUpperCase());
                if (isHexColor(nextValue)) updateThemeColor(selectedColor, nextValue.toUpperCase());
              }}
              style={[styles.hexInput, { borderColor: theme.background, color: theme.text }]}
              value={hexDraft}
            />
          </View>
          <Pressable onPress={resetTheme} style={[styles.resetButton, { borderColor: theme.background }]}>
            <Text style={[styles.resetText, { color: theme.textMuted }]}>Reset colors to originals</Text>
          </Pressable>
        </Card>

        <SectionTitle title="Home layout" />
        <Card>
          <Text style={[styles.settingText, { color: theme.textMuted }]}>The greeting and today&apos;s session always stay visible.</Text>
          {orderedWidgets.map((key, index) => (
            <View key={key} style={styles.widgetRow}>
              <Pressable onPress={() => toggleWidget(key)} style={[styles.visibilityButton, widgets.visible[key] && styles.visibleButton]}>
                <Text style={[styles.visibilityText, { color: theme.textMuted }, widgets.visible[key] && { color: theme.background }]}>{widgets.visible[key] ? 'Shown' : 'Hidden'}</Text>
              </Pressable>
              <Text style={[styles.widgetName, { color: theme.text }]}>{widgetLabels[key]}</Text>
              <Pressable disabled={index === 0} onPress={() => moveWidget(index, -1)} style={styles.orderButton}><Text style={styles.orderText}>↑</Text></Pressable>
              <Pressable disabled={index === orderedWidgets.length - 1} onPress={() => moveWidget(index, 1)} style={styles.orderButton}><Text style={styles.orderText}>↓</Text></Pressable>
            </View>
          ))}
        </Card>

        <SectionTitle title="Your targets" />
        <View style={styles.statsRow}>
          <Card style={styles.stat}><Text style={[styles.label, { color: theme.textMuted }]}>BODY WEIGHT</Text><Text style={[styles.value, { color: theme.text }]}>{defaultProfile.bodyWeightKg} kg</Text></Card>
            <Card style={styles.stat}><Text style={[styles.label, { color: theme.textMuted }]}>CALORIES</Text><Text style={[styles.value, { color: theme.text }]}>{defaultProfile.calorieTarget}</Text></Card>
        </View>
        <Card style={styles.setting}><Text style={[styles.settingTitle, { color: theme.text }]}>Data & privacy</Text><Text style={[styles.settingText, { color: theme.textMuted }]}>Your preferences stay on this device.</Text></Card>
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
  wheel: { alignSelf: 'center', height: 280, marginVertical: spacing.md, position: 'relative', width: 280 },
  hueMarker: { borderColor: colors.white, borderRadius: 19, borderWidth: 3, height: 38, position: 'absolute', width: 38 },
  squareTouchArea: { height: 150, left: 65, overflow: 'hidden', position: 'absolute', top: 65, width: 150 },
  squareHue: { height: '100%', position: 'absolute', width: '100%' },
  squareWhite: { height: '100%', position: 'absolute', width: '100%' },
  squareBlack: { height: '100%', position: 'absolute', width: '100%' },
  squareMarker: { borderColor: colors.white, borderRadius: 9, borderWidth: 2, height: 16, position: 'absolute', width: 16 },
  hexValue: { color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  hexRow: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: spacing.sm },
  hexLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  hexInput: { borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, color: colors.text, fontSize: 13, fontWeight: '800', minWidth: 92, paddingHorizontal: spacing.sm, paddingVertical: 7, textAlign: 'center' },
  resetButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, marginTop: spacing.md, padding: spacing.sm },
  resetText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
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
