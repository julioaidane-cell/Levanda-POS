import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { darkColors, lightColors, type ColorPalette } from './colors';

export type ColorSchemeName = 'light' | 'dark';

export interface AppTheme {
  scheme: ColorSchemeName;
  isDark: boolean;
  colors: ColorPalette;
}

const ThemeContext = createContext<AppTheme>({
  scheme: 'light',
  isDark: false,
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';

  const value = useMemo<AppTheme>(
    () => ({ scheme: isDark ? 'dark' : 'light', isDark, colors: isDark ? darkColors : lightColors }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the active palette and scheme. */
export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}

/** Shorthand for components that only need colours. */
export function useThemeColors(): ColorPalette {
  return useContext(ThemeContext).colors;
}

/**
 * `makeStyles` memoises a `StyleSheet` per palette. Because the palette objects
 * are stable module constants, switching light/dark only builds each sheet
 * once. Usage:
 *
 * ```ts
 * const useStyles = makeStyles((c) => StyleSheet.create({ card: { backgroundColor: c.surface } }));
 * // inside the component:
 * const styles = useStyles();
 * ```
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: ColorPalette) => T) {
  const cache = new Map<ColorPalette, T>();
  return function useStyles(): T {
    const { colors } = useContext(ThemeContext);
    let styles = cache.get(colors);
    if (styles === undefined) {
      styles = factory(colors);
      cache.set(colors, styles);
    }
    return styles;
  };
}

/** True when the OS "Reduce Motion" accessibility setting is on. */
export function useReduceMotion(): boolean {
  return useReducedMotion();
}
