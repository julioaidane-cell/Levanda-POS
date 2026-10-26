import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { TextInput, type StyleProp, type TextInputInstance, type TextInputProps, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Touchable } from './Touchable';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';

const AnimatedView = Animated.View;

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (next: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((c) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: c.surface,
  },
  input: { flex: 1, ...typography.body, color: c.text, paddingVertical: spacing.sm },
}));

export const SearchBar = forwardRef<TextInputInstance, SearchBarProps>(function SearchBar(
  { value, onChangeText, placeholder = 'Search…', containerStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [colors.border, colors.primary]),
  }));

  return (
    <AnimatedView style={[styles.container, animatedBorder, containerStyle]}>
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
        style={styles.input}
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
      {value.length > 0 ? (
        <Touchable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          haptic="selection"
          scaleTo={0.9}
          hitSlop={10}
          onPress={() => onChangeText('')}
        >
          <Ionicons name="close-circle" size={17} color={colors.textDisabled} />
        </Touchable>
      ) : null}
    </AnimatedView>
  );
});
