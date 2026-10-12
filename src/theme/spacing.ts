/**
 * Spacing, sizing, radius, border, elevation and motion tokens.
 * A single 4pt-based scale keeps rhythm consistent across screens.
 */

import { Easing } from 'react-native-reanimated';

/** 4pt grid. Each step is a multiple of 4 for pixel-crisp layouts. */
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
  giant: 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

/** Minimum comfortable touch target (Apple HIG / Material). */
export const hitSize = {
  min: 44,
  control: 48,
  large: 56,
} as const;

export const borderWidth = {
  none: 0,
  hairline: 1,
  /** The outlined section-tab pill. */
  pill: 1.5,
  thick: 2,
} as const;

/**
 * Soft, low-opacity elevation. Three usable levels plus a sheet shadow.
 * Shadows stay subtle on iOS and lean on Android `elevation`.
 */
export const elevation = {
  none: {},
  xs: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sm: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  md: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  lg: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  sheet: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
} as const;

/** Motion tokens: durations, easings and spring configs shared by animations. */
export const duration = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

export const easing = {
  /** Default for most enter/exit motion. */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  /** Elements coming on screen. */
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  /** Elements leaving the screen. */
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  /** Expressive motion for attention-drawing moments. */
  emphasized: Easing.bezier(0.2, 0, 0, 1),
} as const;

export const spring = {
  /** Press-scale feedback. */
  press: { damping: 18, stiffness: 320, mass: 0.5 },
  /** Sheets and modals. */
  sheet: { damping: 26, stiffness: 240, mass: 0.9 },
} as const;

export const motion = { duration, easing, spring } as const;

export const layout = {
  screenPadding: spacing.lg,
  tabBarHeight: 60,
  maxContentWidth: 560,
  /** Height of a section-tab pill (touch target is larger via hitSlop). */
  pillHeight: 40,
  /** Size of the round "»" overflow button at the end of the section tabs. */
  overflowButtonSize: 32,
  /** Round controls in the app header: bell button and avatar. */
  headerControl: 40,
  /** Floating action button diameter. */
  fabSize: 56,
  /**
   * Extra bottom padding for scrollable screens that show a FAB, so the button
   * never sits on top of the last row (tab bar + FAB + breathing room).
   */
  fabClearance: 60 + 56 + spacing.xxl,
} as const;

export type SpacingToken = keyof typeof spacing;
