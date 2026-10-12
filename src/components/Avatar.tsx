import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { typography, useTheme } from '@/theme';
import { initialsOf } from '@/utils/format';

export interface AvatarProps {
  /** Name used to derive the initials and the generated background colour. */
  name?: string | null;
  size?: number;
  /** Renders a rounded-square instead of a circle (used for shops). */
  shape?: 'circle' | 'square';
  style?: StyleProp<ViewStyle>;
}

/** Stable hash so a given name always gets the same colour. */
function accentIndex(seed: string, count: number): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return count === 0 ? 0 : hash % count;
}

/**
 * Initials avatar with an automatically generated, deterministic colour from
 * the palette's accent ramp. Used for users and shops.
 */
export function Avatar({ name, size = 44, shape = 'circle', style }: AvatarProps) {
  const { colors } = useTheme();
  const initials = initialsOf(name);
  const background = colors.accents[accentIndex(name ?? initials, colors.accents.length)] ?? colors.primary;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name ? `${name} avatar` : 'Avatar'}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : size * 0.3,
          backgroundColor: background,
        },
        style,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.text,
          { fontSize: size * 0.4, lineHeight: size * 0.5, color: colors.onChrome },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { ...typography.bodyStrong },
});
