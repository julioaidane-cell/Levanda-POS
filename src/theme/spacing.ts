/**
 * Spacing, sizing, radius, border and elevation tokens.
 * A single 4pt-based scale keeps rhythm consistent across screens.
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

/** Minimum comfortable touch target. */
export const hitSize = {
  min: 44,
  control: 48,
} as const;

export const borderWidth = {
  hairline: 1,
  thick: 2,
} as const;

export const elevation = {
  none: {},
  card: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
} as const;

export const layout = {
  screenPadding: spacing.lg,
  tabBarHeight: 58,
} as const;

export type SpacingToken = keyof typeof spacing;