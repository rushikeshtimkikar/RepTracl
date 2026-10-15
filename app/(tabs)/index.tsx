import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, ProgressBar, Screen, SectionTitle } from '@/components/Ui';
import { colors, radii, spacing } from '@/constants/Colors';
import { HomeWidgetKey, usePreferences } from '@/contexts/PreferencesContext';
import { defaultProfile } from '@/data/defaults';

const weekdays = [
  { day: 'M', label: 'Chest', done: true },
  { day: 'T', label: 'Back', done: true },
  { day: 'W', label: 'Legs', done: false, active: true },
  { day: 'T', label: 'Shoulders', done: false },
  { day: 'F', label: 'Rest', done: false },
  { day: 'S', label: 'Cardio', done: false },
  { day: 'S', label: 'Chest + Back', done: false },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, widgets, profileName } = usePreferences();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  function renderWidget(key: HomeWidgetKey) {
    if (!widgets.visible[key]) return null;
    if (key === 'weekly-schedule') {
      return (
        <View key={key}>
          <SectionTitle title="This week" action="Edit schedule" />
          <Card style={styles.scheduleCard}>
            <View style={styles.weekRow}>
              {weekdays.map((item, index) => (
                <View key={`${item.day}-${index}`} style={styles.dayItem}>
                  <Text style={[styles.dayLabel, { color: theme.textMuted }, item.active && { color: theme.accent }]}>{item.day}</Text>
                  <View style={[styles.dayDot, { borderColor: theme.background }, item.done && { backgroundColor: theme.accent, borderColor: theme.accent }, item.active && { borderColor: theme.accent }]}>
                    {item.done ? <Text style={[styles.check, { color: theme.background }]}>✓</Text> : null}
                  </View>
                </View>
              ))}
            </View>
            <Text style={[styles.scheduleCaption, { color: theme.textMuted }]}>2 of 4 workouts completed</Text>
            <ProgressBar progress={0.5} />
          </Card>
        </View>
      );
    }
    if (key === 'streak') {
      return (
        <View key={key} style={styles.twoColumn}>
          <Card style={styles.smallCard}>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>BODY WEIGHT</Text>
            <Text style={[styles.metricValue, { color: theme.text }]}>{defaultProfile.bodyWeightKg}<Text style={[styles.metricUnit, { color: theme.textMuted }]}> kg</Text></Text>
            <Text style={[styles.trend, { color: theme.accent }]}>↓ 0.8 kg this month</Text>
          </Card>
          <Card style={styles.smallCard}>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>STREAK</Text>
            <Text style={[styles.metricValue, { color: theme.text }]}>12<Text style={[styles.metricUnit, { color: theme.textMuted }]}> days</Text></Text>
            <Text style={[styles.trend, { color: theme.accent }]}>Personal best</Text>
          </Card>
        </View>
      );
    }
    return (
      <View key={key}>
        <SectionTitle title="Quick actions" />
        <View style={styles.actions}>
          {['Log weight', 'Add water', 'Log workout'].map((label) => <View key={label} style={styles.action}><View style={[styles.actionIcon, { backgroundColor: theme.surface, borderColor: theme.accent }]}><Text style={[styles.actionPlus, { color: theme.accent }]}>+</Text></View><Text style={[styles.actionLabel, { color: theme.textMuted }]}>{label}</Text></View>)}
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
          <Text style={[styles.eyebrow, { color: theme.accent }]}>{date.toUpperCase()}</Text>
          <Text style={[styles.greeting, { color: theme.text }]}>Good evening, {profileName}</Text>
          </View>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}><Text style={[styles.avatarText, { color: theme.background }]}>A</Text></View>
        </View>

        <Card style={[styles.hero, { backgroundColor: theme.surface }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.accent }]}>TODAY&apos;S SESSION</Text>
              <Text style={[styles.heroTitle, { color: theme.text }]}>Legs</Text>
              <Text style={styles.muted}>Quads · Hamstrings · Glutes</Text>
            </View>
            <View style={[styles.heroIcon, { backgroundColor: theme.surface }]}><SymbolView name={{ ios: 'figure.strengthtraining.traditional', android: 'fitness_center', web: 'fitness_center' }} tintColor={theme.accent} size={28} /></View>
          </View>
          <PrimaryButton label="Start workout" onPress={() => router.push('/workout')} />
        </Card>

        {widgets.order.map(renderWidget)}

        <SectionTitle title="Daily nutrition" action="Log food" />
        <Card>
          <View style={styles.nutritionHeader}>
            <View><Text style={[styles.cardLabel, { color: theme.textMuted }]}>CALORIES</Text><Text style={[styles.nutritionValue, { color: theme.text }]}>1,480 <Text style={[styles.muted, { color: theme.textMuted }]}>/ 2,350 kcal</Text></Text></View>
            <Text style={[styles.percentage, { color: theme.accent }]}>63%</Text>
          </View>
          <ProgressBar progress={0.63} />
          <View style={styles.macroRow}><Text style={[styles.macroText, { color: theme.textMuted }]}>Protein <Text style={[styles.macroValue, { color: theme.text }]}>112 / {defaultProfile.proteinTargetGrams}g</Text></Text><Text style={[styles.macroText, { color: theme.textMuted }]}>Water <Text style={[styles.macroValue, { color: theme.text }]}>1.5 / 2.5L</Text></Text></View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 34 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg, paddingTop: spacing.sm },
  eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  greeting: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 5 },
  avatar: { alignItems: 'center', backgroundColor: colors.lime, borderRadius: radii.pill, height: 42, justifyContent: 'center', width: 42 },
  avatarText: { color: colors.background, fontSize: 17, fontWeight: '800' },
  hero: { backgroundColor: colors.surfaceRaised, marginBottom: spacing.lg, padding: spacing.lg },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  heroTitle: { color: colors.text, fontSize: 32, fontWeight: '800', marginVertical: 4 },
  muted: { color: colors.textMuted, fontSize: 13 },
  heroIcon: { alignItems: 'center', backgroundColor: '#2B3921', borderRadius: radii.md, height: 58, justifyContent: 'center', width: 58 },
  scheduleCard: { marginBottom: spacing.lg },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 7 },
  dayLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  dayDot: { alignItems: 'center', borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, height: 27, justifyContent: 'center', width: 27 },
  activeText: { color: colors.lime },
  activeDot: { borderColor: colors.lime, borderWidth: 2 },
  doneDot: { backgroundColor: colors.lime, borderColor: colors.lime },
  check: { color: colors.background, fontSize: 15, fontWeight: '800' },
  scheduleCaption: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm, marginTop: spacing.md },
  twoColumn: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  smallCard: { flex: 1 },
  cardLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 },
  metricValue: { color: colors.text, fontSize: 24, fontWeight: '800' },
  metricUnit: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  trend: { color: colors.limeMuted, fontSize: 11, marginTop: 8 },
  nutritionHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  nutritionValue: { color: colors.text, fontSize: 21, fontWeight: '800' },
  percentage: { color: colors.lime, fontSize: 13, fontWeight: '800' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  macroText: { color: colors.textMuted, fontSize: 12 },
  macroValue: { color: colors.text, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { alignItems: 'center', gap: 7 },
  actionIcon: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, height: 54, justifyContent: 'center', width: 76 },
  actionPlus: { color: colors.lime, fontSize: 25, fontWeight: '300' },
  actionLabel: { color: colors.textMuted, fontSize: 11 },
});
