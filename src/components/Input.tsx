import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Touchable } from './Touchable';
import { makeStyles, spacing, typography, useTheme } from '@/theme';

const AnimatedView = Animated.View;

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  required?: boolean;
  /** Shows a clear (×) button while the field has text. Defaults to true for non-secure fields. */
  clearable?: boolean;
}

const useStyles = makeStyles((c) => ({
  container: { gap: spacing.xs },
  label: { ...typography.label, color: c.textSecondary },
  required: { color: c.danger },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: c.surface,
  },
  input: { flex: 1, ...typography.body, color: c.text, paddingVertical: spacing.md },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  errorText: { ...typography.caption, color: c.danger, flex: 1 },
  hintText: { ...typography.caption, color: c.textMuted },
  trailing: { padding: spacing.xs },
}));

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    icon,
    containerStyle,
    inputStyle,
    required,
    clearable,
    secureTextEntry,
    onFocus,
    onBlur,
    onChangeText,
    value,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isSecure = Boolean(secureTextEntry);
  const showClear = (clearable ?? !isSecure) && typeof value === 'string' && value.length > 0;

  const focusProgress = useSharedValue(0);
  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.danger
      : interpolateColor(focusProgress.value, [0, 1], [colors.border, colors.primary]),
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <AnimatedView style={[styles.field, animatedBorder]}>
        {icon ? <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textMuted} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textDisabled}
          selectionColor={colors.primary}
          value={value}
          secureTextEntry={isSecure && !revealed}
          onChangeText={onChangeText}
          style={[styles.input, inputStyle]}
          onFocus={(event) => {
            setFocused(true);
            focusProgress.value = withTiming(1, { duration: 160 });
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            focusProgress.value = withTiming(0, { duration: 160 });
            onBlur?.(event);
          }}
          {...rest}
        />

        {showClear ? (
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Clear field"
            haptic="selection"
            scaleTo={0.9}
            hitSlop={8}
            onPress={() => onChangeText?.('')}
            style={styles.trailing}
          >
            <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
          </Touchable>
        ) : null}

        {isSecure ? (
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            haptic="selection"
            scaleTo={0.9}
            hitSlop={8}
            onPress={() => setRevealed((current) => !current)}
            style={styles.trailing}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={focused ? colors.primary : colors.textMuted}
            />
          </Touchable>
        ) : null}
      </AnimatedView>

      {error ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.messageRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
});
