import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, hitSize, radius, spacing, typography } from '@/theme';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (next: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
  { value, onChangeText, placeholder = 'Search…', containerStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && styles.containerFocused,
        containerStyle,
      ]}
    >
      <Ionicons name="search" size={17} color={focused ? colors.primary : colors.textMuted} />
      <TextInput
        ref={ref}
        accessibilityLabel="Search"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        selectionColor={colors.primary}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={styles.input}
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
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={() => onChangeText('')}
        >
          <Ionicons name="close-circle" size={17} color={colors.textDisabled} />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: hitSize.control,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  containerFocused: { borderColor: colors.primary },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
});