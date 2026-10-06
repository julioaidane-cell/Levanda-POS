/**
 * Levanda POS colour tokens.
 *
 * Values were extracted from the supplied Levanda POS screenshots by sampling
 * and quantising the raw pixels (dominant teal `#00A8C0`, near-black chrome
 * `#0A0A0A` / `#181818`, light lavender-grey surfaces, grey text ramp).
 * Every screen must reference these tokens instead of literal colour strings.
 */

const primaryScale = {
  50: '#F0F8F8',
  100: '#E1F4F6',
  200: '#B8E0E8',
  300: '#98D8E0',
  400: '#4FC0D0',
  500: '#00A8C0',
  600: '#00889C',
  700: '#006B7A',
  800: '#004E59',
} as const;

const neutralScale = {
  0: '#FFFFFF',
  50: '#F8F8F8',
  100: '#F0F0F8',
  200: '#E4E4EA',
  300: '#D0D0D0',
  400: '#A0A0A0',
  500: '#888888',
  600: '#686868',
  700: '#484848',
  800: '#282828',
  900: '#181818',
} as const;

export const colors = {
  /** Brand teal. */
  primary: primaryScale[500],
  primaryDark: primaryScale[600],
  primaryDarker: primaryScale[700],
  primaryLight: primaryScale[400],
  primarySoft: primaryScale[300],
  primaryTint: primaryScale[100],
  primaryWash: primaryScale[50],
  primaryScale,

  /** Near-black chrome used by the app bar and tab bar. */
  chrome: '#0A0A0A',
  chromeSoft: neutralScale[900],
  chromeMuted: neutralScale[600],

  background: neutralScale[50],
  surface: neutralScale[0],
  surfaceMuted: neutralScale[100],
  border: neutralScale[200],
  borderStrong: neutralScale[300],

  text: neutralScale[900],
  textSecondary: neutralScale[600],
  textMuted: neutralScale[500],
  textDisabled: neutralScale[400],
  textInverse: neutralScale[0],

  success: '#1F9D55',
  successTint: '#E6F5EC',
  warning: '#D97706',
  warningTint: '#FDF3E3',
  danger: '#DC2626',
  dangerTint: '#FCEBEB',
  info: primaryScale[500],
  infoTint: primaryScale[100],

  /** Olive accent observed in chart/status chips. */
  accent: '#789020',
  accentTint: '#EFF3DE',

  overlay: 'rgba(10, 10, 10, 0.55)',

  neutralScale,
} as const;

export type ColorToken = keyof typeof colors;