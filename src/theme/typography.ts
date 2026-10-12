import type { TextStyle } from 'react-native';

/**
 * Typography tokens.
 *
 * Type is set in Inter (loaded through `@expo-google-fonts/inter`). A single
 * scale — display / title / heading / subheading / body / label / caption /
 * overline — keeps hierarchy predictable across every screen. Weights are
 * baked into distinct family names because React Native requires the exact
 * loaded family per weight.
 */

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 30,
  hero: 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const letterSpacing = {
  tighter: -0.6,
  tight: -0.3,
  normal: 0,
  wide: 0.6,
  wider: 1,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.45,
  relaxed: 1.55,
} as const;

type VariantName =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'overline'
  | 'mono'
  | 'button';

type TypeVariant = Pick<
  TextStyle,
  'fontSize' | 'fontWeight' | 'letterSpacing' | 'lineHeight' | 'fontFamily'
>;

export const typography: Record<VariantName, TypeVariant> = {
  display: {
    fontSize: fontSize.display,
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tighter,
    lineHeight: Math.round(fontSize.display * lineHeight.tight),
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: Math.round(fontSize.xxl * lineHeight.snug),
  },
  heading: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
    lineHeight: Math.round(fontSize.lg * lineHeight.snug),
  },
  subheading: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: Math.round(fontSize.md * lineHeight.normal),
  },
  body: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: Math.round(fontSize.base * lineHeight.normal),
  },
  bodyStrong: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.semibold,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: Math.round(fontSize.base * lineHeight.normal),
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
    lineHeight: Math.round(fontSize.sm * lineHeight.normal),
  },
  caption: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: Math.round(fontSize.sm * lineHeight.normal),
  },
  overline: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
    lineHeight: Math.round(fontSize.xs * lineHeight.normal),
  },
  mono: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: Math.round(fontSize.sm * lineHeight.normal),
  },
  button: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.semibold,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: Math.round(fontSize.base * lineHeight.tight),
  },
};

export type TypographyVariant = VariantName;
