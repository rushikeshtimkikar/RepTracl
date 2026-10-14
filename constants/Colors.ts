export const colors = {
  background: '#0B0D0C',
  surface: '#141817',
  surfaceRaised: '#1B211F',
  border: '#29312E',
  lime: '#C7F36B',
  limeMuted: '#829D43',
  text: '#F4F7F2',
  textMuted: '#9BA59F',
  textFaint: '#69746D',
  danger: '#FF7E74',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.lime,
    tabIconDefault: colors.textFaint,
    tabIconSelected: colors.lime,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    tint: colors.lime,
    tabIconDefault: colors.textFaint,
    tabIconSelected: colors.lime,
  },
};
