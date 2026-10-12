/**
 * Levanda POS colour tokens.
 *
 * Brand values were extracted from the supplied Levanda POS screenshots by
 * sampling and quantising the raw pixels (dominant teal `#00A8C0`, near-black
 * chrome `#0A0A0A` / `#181818`, light lavender-grey surfaces, grey text ramp).
 *
 * Two complete palettes share the exact same token keys so every screen can be
 * themed at runtime: `lightColors` (the measured web palette) and `darkColors`
 * (a cool near-black ramp derived from the same teal). Body text is tuned to
 * meet WCAG AA (>= 4.5:1) on its intended surface in both modes.
 */

export const primaryScale = {
  50: '#F0F8F8',
  100: '#E1F4F6',
  200: '#B8E0E8',
  300: '#98D8E0',
  400: '#4FC0D0',
  500: '#00A8C0',
  600: '#00889C',
  650: '#007A8C',
  700: '#006B7A',
  800: '#004E59',
  900: '#003039',
} as const;

export const neutralScale = {
  0: '#FFFFFF',
  50: '#F8F9FB',
  100: '#F0F1F5',
  200: '#E4E6EC',
  300: '#D0D3DB',
  400: '#A0A5B0',
  500: '#888E99',
  600: '#686E79',
  700: '#484D57',
  800: '#282C33',
  900: '#181B20',
} as const;

/** Dark-mode neutral ramp (slightly cool, matched to the brand teal). */
export const neutralDark = {
  0: '#FFFFFF',
  50: '#F4F6F8',
  100: '#E6EAEE',
  200: '#CBD2D9',
  300: '#A7B0B9',
  400: '#7E8894',
  500: '#626C78',
  600: '#49525C',
  700: '#333B44',
  800: '#212831',
  900: '#151A20',
} as const;

export interface ColorPalette {
  /* Brand */
  primary: string;
  primaryDark: string;
  primaryDarker: string;
  primaryLight: string;
  primarySoft: string;
  primaryTint: string;
  primaryWash: string;
  onPrimary: string;
  onDanger: string;
  primaryScale: typeof primaryScale;

  /* Chrome (always-dark brand surfaces: auth + product heroes) */
  chrome: string;
  chromeSoft: string;
  chromeMuted: string;
  chromeBorder: string;
  onChrome: string;
  onChromeMuted: string;
  onChromeWash: string;

  /* App bar — theme-aware (light header in light mode, dark in dark mode) */
  headerBackground: string;
  headerText: string;
  headerSubtext: string;
  headerIcon: string;
  headerPill: string;
  headerPillBorder: string;

  /* Bottom tab bar — theme-aware */
  tabBarBackground: string;
  tabBarBorder: string;
  tabIconActive: string;
  tabIconInactive: string;

  /* Surfaces */
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;

  /* Text */
  text: string;
  /** Alias of `text`; the primary body/heading colour. */
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textInverse: string;
  /** Text/icon colour on top of the brand `primary` fill. */
  textOnPrimary: string;

  /* Semantic */
  success: string;
  successTint: string;
  successStrong: string;
  warning: string;
  warningTint: string;
  warningStrong: string;
  danger: string;
  dangerTint: string;
  dangerStrong: string;
  info: string;
  infoTint: string;
  accent: string;
  accentTint: string;

  /* Utility */
  overlay: string;
  scrim: string;
  skeleton: string;
  skeletonHighlight: string;
  focusRing: string;
  divider: string;

  /* Brand gradient */
  gradientFrom: string;
  gradientTo: string;

  /* Avatar / chart accents (deterministic, generated from a seed) */
  accents: readonly string[];
}

export const lightColors: ColorPalette = {
  // Slightly-darkened brand teal so white button text clears 4.5:1 and teal
  // icons clear 3:1 on the light background.
  primary: primaryScale[650],
  primaryDark: primaryScale[700],
  primaryDarker: primaryScale[800],
  primaryLight: primaryScale[400],
  primarySoft: primaryScale[300],
  primaryTint: primaryScale[100],
  primaryWash: primaryScale[50],
  onPrimary: neutralScale[0],
  onDanger: neutralScale[0],
  primaryScale,

  // Always-dark brand chrome, used by the auth + product heroes in both modes.
  chrome: '#0A0A0A',
  chromeSoft: neutralScale[900],
  chromeMuted: neutralScale[400],
  chromeBorder: 'rgba(255,255,255,0.10)',
  onChrome: neutralScale[0],
  onChromeMuted: 'rgba(255,255,255,0.72)',
  onChromeWash: 'rgba(255,255,255,0.14)',

  // Theme-aware app bar: white surface, dark text, subtle teal pill.
  headerBackground: neutralScale[0],
  headerText: neutralScale[900],
  headerSubtext: neutralScale[600],
  headerIcon: neutralScale[700],
  headerPill: primaryScale[50],
  headerPillBorder: primaryScale[200],

  // Theme-aware tab bar: white surface with a subtle top border.
  tabBarBackground: neutralScale[0],
  tabBarBorder: neutralScale[200],
  tabIconActive: primaryScale[650],
  tabIconInactive: neutralScale[500],

  background: neutralScale[50],
  surface: neutralScale[0],
  surfaceMuted: neutralScale[100],
  surfaceElevated: neutralScale[0],
  border: neutralScale[200],
  borderStrong: neutralScale[300],

  text: neutralScale[900],
  textPrimary: neutralScale[900],
  textSecondary: neutralScale[600],
  textMuted: '#6B7280',
  textDisabled: neutralScale[500],
  textInverse: neutralScale[0],
  textOnPrimary: neutralScale[0],

  success: '#1F9D55',
  successTint: '#E6F5EC',
  successStrong: '#15763F',
  warning: '#B45309',
  warningTint: '#FDF3E3',
  warningStrong: '#92400E',
  danger: '#DC2626',
  dangerTint: '#FCEBEB',
  dangerStrong: '#B91C1C',
  info: primaryScale[600],
  infoTint: primaryScale[100],
  accent: '#6B7F1A',
  accentTint: '#EFF3DE',

  overlay: 'rgba(10, 10, 10, 0.55)',
  scrim: 'rgba(10, 10, 10, 0.35)',
  skeleton: '#E9EBF0',
  skeletonHighlight: '#F6F7FA',
  focusRing: 'rgba(0, 168, 192, 0.30)',
  divider: neutralScale[200],

  gradientFrom: primaryScale[600],
  gradientTo: primaryScale[400],

  accents: ['#0E7490', '#4338CA', '#B45309', '#15803D', '#BE185D', '#7C3AED', '#0F766E', '#B91C1C'],
};

export const darkColors: ColorPalette = {
  primary: primaryScale[400],
  primaryDark: primaryScale[300],
  primaryDarker: primaryScale[200],
  primaryLight: primaryScale[300],
  primarySoft: primaryScale[700],
  primaryTint: '#10333B',
  primaryWash: '#0C262C',
  onPrimary: '#032126',
  onDanger: '#3B0A0A',
  primaryScale,

  chrome: '#11151A',
  chromeSoft: neutralDark[800],
  chromeMuted: neutralDark[300],
  chromeBorder: '#232B34',
  onChrome: '#FFFFFF',
  onChromeMuted: 'rgba(255,255,255,0.72)',
  onChromeWash: 'rgba(255,255,255,0.14)',

  // Theme-aware app bar: raised dark surface, light text, teal-tinted pill.
  headerBackground: '#1B222A',
  headerText: '#F3F6F8',
  headerSubtext: neutralDark[300],
  headerIcon: neutralDark[100],
  headerPill: '#10333B',
  headerPillBorder: '#1F4A54',

  // Theme-aware tab bar: raised dark surface with a visible top border.
  tabBarBackground: '#1B222A',
  tabBarBorder: '#29313A',
  tabIconActive: primaryScale[300],
  tabIconInactive: neutralDark[400],

  background: '#0B0E12',
  surface: '#151A20',
  surfaceMuted: '#1D232B',
  surfaceElevated: '#1B222A',
  border: '#29313A',
  borderStrong: '#3A434E',

  text: '#F3F6F8',
  textPrimary: '#F3F6F8',
  textSecondary: neutralDark[300],
  textMuted: '#96A1AC',
  textDisabled: neutralDark[400],
  textInverse: '#0B0E12',
  textOnPrimary: '#032126',

  success: '#4ADE80',
  successTint: '#12301F',
  successStrong: '#86EFAC',
  warning: '#FBBF24',
  warningTint: '#33260F',
  warningStrong: '#FCD34D',
  danger: '#F87171',
  dangerTint: '#33171A',
  dangerStrong: '#FCA5A5',
  info: primaryScale[300],
  infoTint: '#10333B',
  accent: '#A3B84A',
  accentTint: '#232A12',

  overlay: 'rgba(0, 0, 0, 0.66)',
  scrim: 'rgba(0, 0, 0, 0.45)',
  skeleton: '#20262E',
  skeletonHighlight: '#2C343D',
  focusRing: 'rgba(79, 192, 208, 0.35)',
  divider: '#242C34',

  gradientFrom: primaryScale[700],
  gradientTo: primaryScale[500],

  accents: ['#0E7490', '#4338CA', '#B45309', '#15803D', '#BE185D', '#7C3AED', '#0F766E', '#B91C1C'],
};

/**
 * Backwards-compatible static light palette. Prefer `useTheme().colors` in
 * components so the palette follows the active colour scheme; this export
 * exists only for values that genuinely need to be module constants.
 */
export const colors = lightColors;

export type ColorToken = keyof ColorPalette;
