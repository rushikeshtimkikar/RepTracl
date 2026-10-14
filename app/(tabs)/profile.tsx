import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Screen, SectionTitle } from '@/components/Ui';
import { colors, spacing } from '@/constants/Colors';
import { defaultProfile } from '@/data/defaults';

export default function ProfileScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
        <Card style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View><View><Text style={styles.name}>{defaultProfile.name}</Text><Text style={styles.subtitle}>Metric units · Local profile</Text></View></Card>
        <SectionTitle title="Your targets" />
        <View style={styles.statsRow}><Card style={styles.stat}><Text style={styles.label}>BODY WEIGHT</Text><Text style={styles.value}>{defaultProfile.bodyWeightKg} kg</Text></Card><Card style={styles.stat}><Text style={styles.label}>CALORIES</Text><Text style={styles.value}>{defaultProfile.calorieTarget}</Text></Card></View>
        <Card style={styles.setting}><Text style={styles.settingTitle}>Training preferences</Text><Text style={styles.settingText}>Rest timer · 90 seconds</Text><Text style={styles.settingText}>Units · Kilograms & centimeters</Text></Card>
        <Card style={styles.setting}><Text style={styles.settingTitle}>Data & privacy</Text><Text style={styles.settingText}>Your data stays on this device.</Text><Text style={styles.settingText}>Export and backup will be available here.</Text></Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 32 },
  eyebrow: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.sm },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 5, marginBottom: spacing.lg },
  profileCard: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  avatar: { alignItems: 'center', backgroundColor: colors.lime, borderRadius: 30, height: 60, justifyContent: 'center', width: 60 },
  avatarText: { color: colors.background, fontSize: 22, fontWeight: '800' },
  name: { color: colors.text, fontSize: 20, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stat: { flex: 1 },
  label: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  value: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 8 },
  setting: { marginBottom: spacing.md },
  settingTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  settingText: { color: colors.textMuted, fontSize: 13, marginTop: 7 },
});
