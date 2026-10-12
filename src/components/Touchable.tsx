import { useCallback } from 'react';
import { Pressable as RNPressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { motion, useReduceMotion } from '@/theme';
import { haptic, type HapticKind } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface TouchableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Haptic fired on press-in. Defaults to a light tap. */
  haptic?: HapticKind | 'none';
  /** Scale applied while held. Defaults to 0.97. */
  scaleTo?: number;
}

/**
 * Every tappable surface in the app goes through this component: it adds a
 * springy press-scale and a haptic tap while keeping the full `Pressable`
 * API (accessibility roles, states, hitSlop). Honours "reduce motion".
 */
export function Touchable({
  style,
  haptic: hapticKind = 'light',
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: TouchableProps) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: PressableProps['onPressIn'] = useCallback(
    (event) => {
      if (hapticKind !== 'none') haptic[hapticKind]();
      if (!reduceMotion) scale.value = withTiming(scaleTo, { duration: motion.duration.instant });
      onPressIn?.(event);
    },
    [hapticKind, onPressIn, reduceMotion, scale, scaleTo],
  );

  const handlePressOut: PressableProps['onPressOut'] = useCallback(
    (event) => {
      if (!reduceMotion) scale.value = withSpring(1, motion.spring.press);
      onPressOut?.(event);
    },
    [onPressOut, reduceMotion, scale],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    />
  );
}
