import type { TextStyle } from 'react-native';

/**
 * Typography tokens. The Levanda POS UI uses the platform system sans-serif,
 * so no custom font is loaded and weights come from the OS.
 */

const fontFamily = {
  regular: undefined,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 30,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const letterSpacing = {
  tight: -0.3,
  normal: 0,
  wide: 0.6,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.45,
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
  | 'mono';

type TypeVariant = Pick<
  TextStyle,
  'fontSize' | 'fontWeight' | 'letterSpacing' | 'lineHeight' | 'fontFamily'
>;

export const typography: Record<VariantName, TypeVariant> = {
  display: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.tight * fontSize.display,
    fontFamily: fontFamily.regular,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.tight * fontSize.xxl,
    fontFamily: fontFamily.regular,
  },
  heading: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.lg,
    fontFamily: fontFamily.regular,
  },
  subheading: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.md,
    fontFamily: fontFamily.regular,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal * fontSize.base,
    fontFamily: fontFamily.regular,
  },
  bodyStrong: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.base,
    fontFamily: fontFamily.regular,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal * fontSize.sm,
    fontFamily: fontFamily.regular,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal * fontSize.xs,
    fontFamily: fontFamily.regular,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeight.normal * fontSize.xs,
    fontFamily: fontFamily.regular,
  },
  mono: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.sm,
    fontFamily: fontFamily.regular,
  },
};

export type TypographyVariant = VariantName;