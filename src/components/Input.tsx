import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, hitSize, radius, spacing, typography } from '@/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, icon, containerStyle, inputStyle, required, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          { borderColor },
          focused && !error && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textMuted} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textDisabled}
          selectionColor={colors.primary}
          style={[styles.input, inputStyle]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </View>

      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textSecondary },
  required: { color: colors.danger },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: hitSize.control,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  fieldFocused: { borderWidth: 1.5 },
  fieldError: { backgroundColor: colors.dangerTint },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  errorText: { ...typography.caption, color: colors.danger, flex: 1 },
  hintText: { ...typography.caption, color: colors.textMuted },
});