import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, ProgressBar, Screen, SectionTitle } from '@/components/Ui';
import { colors, spacing } from '@/constants/Colors';

export default function ProgressScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>INSIGHTS</Text>
        <Text style={styles.title}>Your progress</Text>
        <Text style={styles.subtitle}>Small improvements add up.</Text>
        <View style={styles.filters}><Text style={styles.filterActive}>4 WEEKS</Text><Text style={styles.filter}>3 MONTHS</Text><Text style={styles.filter}>ALL TIME</Text></View>
        <Card style={styles.chartCard}>
          <Text style={styles.cardLabel}>BODY WEIGHT</Text>
          <Text style={styles.metric}>86.0 <Text style={styles.unit}>kg</Text></Text>
          <Text style={styles.change}>↓ 0.8 kg since last month</Text>
          <View style={styles.chart}><View style={styles.chartLine}><View style={styles.point} /><View style={styles.point} /><View style={styles.point} /><View style={styles.point} /><View style={styles.point} /></View></View>
          <View style={styles.chartLabels}><Text>Sep 20</Text><Text>Oct 14</Text></View>
        </Card>
        <SectionTitle title="Training overview" />
        <View style={styles.statsRow}>
          <Card style={styles.stat}><Text style={styles.cardLabel}>SESSIONS</Text><Text style={styles.statValue}>12</Text><Text style={styles.statCaption}>this month</Text></Card>
          <Card style={styles.stat}><Text style={styles.cardLabel}>VOLUME</Text><Text style={styles.statValue}>18.4k</Text><Text style={styles.statCaption}>kg lifted</Text></Card>
        </View>
        <Card><View style={styles.consistency}><View><Text style={styles.cardLabel}>CONSISTENCY</Text><Text style={styles.consistencyText}>You&apos;re on track</Text></View><Text style={styles.consistencyScore}>86%</Text></View><ProgressBar progress={0.86} /></Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 32 },
  eyebrow: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.sm },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 5 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
  filters: { flexDirection: 'row', gap: spacing.lg, marginVertical: spacing.lg },
  filter: { color: colors.textFaint, fontSize: 11, fontWeight: '800' },
  filterActive: { color: colors.lime, fontSize: 11, fontWeight: '800' },
  chartCard: { marginBottom: spacing.lg },
  cardLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  metric: { color: colors.text, fontSize: 27, fontWeight: '800', marginTop: 7 },
  unit: { color: colors.textMuted, fontSize: 13 },
  change: { color: colors.limeMuted, fontSize: 12, marginTop: 4 },
  chart: { height: 120, justifyContent: 'center', marginTop: spacing.sm },
  chartLine: { alignItems: 'center', borderBottomColor: colors.lime, borderBottomWidth: 2, flexDirection: 'row', justifyContent: 'space-around', transform: [{ rotate: '-5deg' }] },
  point: { backgroundColor: colors.lime, borderColor: colors.surface, borderRadius: 5, borderWidth: 2, height: 10, marginBottom: -5, width: 10 },
  chartLabels: { color: colors.textFaint, flexDirection: 'row', fontSize: 10, justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stat: { flex: 1 },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 7 },
  statCaption: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  consistency: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  consistencyText: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 6 },
  consistencyScore: { color: colors.lime, fontSize: 24, fontWeight: '800' },
});
