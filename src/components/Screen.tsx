import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, spacing } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  /** Adds bottom padding so content clears the tab bar. */
  withTabBar?: boolean;
  /** Lifts content above the software keyboard — use on form screens. */
  keyboardAware?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Screen shell providing the background colour and optional keyboard inset. */
export function Screen({ children, withTabBar = false, keyboardAware = false, style }: ScreenProps) {
  const content = (
    <View style={[styles.flex, withTabBar && styles.withTabBar, style]}>{children}</View>
  );

  if (!keyboardAware) return content;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

export interface ScreenScrollProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Scrollable body with sensible defaults: touch-friendly tap handling, drag to
 * dismiss the keyboard, and optional pull-to-refresh.
 */
export function ScreenScroll({ children, onRefresh, refreshing = false, contentContainerStyle }: ScreenScrollProps) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...(onRefresh ? { onRefresh, refreshing } : {})}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  withTabBar: { paddingBottom: layout.tabBarHeight + spacing.xl },
  scrollContent: { padding: layout.screenPadding, paddingBottom: spacing.huge, gap: spacing.md },
});