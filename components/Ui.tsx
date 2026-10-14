import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/constants/Colors';

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function ProgressBar({ progress, color = colors.lime }: { progress: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Text style={styles.buttonArrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionTitle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionHeading: { color: colors.text, fontSize: 17, fontWeight: '700' },
  sectionAction: { color: colors.lime, fontSize: 13, fontWeight: '600' },
  progressTrack: { backgroundColor: colors.border, borderRadius: radii.pill, height: 7, overflow: 'hidden' },
  progressFill: { borderRadius: radii.pill, height: '100%' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.lime,
    borderRadius: radii.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  primaryButtonText: { color: colors.background, fontSize: 15, fontWeight: '800' },
  buttonArrow: { color: colors.background, fontSize: 20, fontWeight: '700', marginLeft: spacing.sm },
  pressed: { opacity: 0.75 },
});
