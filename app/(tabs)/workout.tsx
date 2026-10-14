import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, PrimaryButton, Screen, SectionTitle } from '@/components/Ui';
import { colors, spacing } from '@/constants/Colors';
import { exercises, weeklySchedule } from '@/data/defaults';

export default function WorkoutScreen() {
  const router = useRouter();
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TRAINING</Text>
        <Text style={styles.title}>Your workouts</Text>
        <Text style={styles.subtitle}>Build momentum, one session at a time.</Text>
        <Card style={styles.startCard}>
          <Text style={styles.cardKicker}>UP NEXT</Text>
          <Text style={styles.cardTitle}>Legs</Text>
          <Text style={styles.subtitle}>0 exercises · Ready to customize</Text>
          <PrimaryButton label="Start session" onPress={() => router.push('/workout')} />
        </Card>
        <SectionTitle title="Workout templates" action="Manage" />
        {weeklySchedule.slice(0, 4).map((workout) => (
          <Card key={workout.id} style={styles.template}>
            <View><Text style={styles.templateDay}>{workout.day.toUpperCase()}</Text><Text style={styles.templateName}>{workout.name}</Text></View>
            <Text style={styles.chevron}>›</Text>
          </Card>
        ))}
        <SectionTitle title="Exercise library" action={`${exercises.length} exercises`} />
        <Card><Text style={styles.libraryHint}>Search by muscle group or equipment when you start building a session.</Text></Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 32 },
  eyebrow: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.sm },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 5 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
  startCard: { backgroundColor: colors.surfaceRaised, marginVertical: spacing.lg, padding: spacing.lg },
  cardKicker: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
  template: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  templateDay: { color: colors.textFaint, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  templateName: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
  chevron: { color: colors.textMuted, fontSize: 28 },
  libraryHint: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
});
