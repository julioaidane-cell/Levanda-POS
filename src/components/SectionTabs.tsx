import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Touchable } from './Touchable';
import { SECTIONS, activeSectionKey, type SectionTab } from '@/navigation/sections';
import {
  borderWidth,
  fontFamily,
  hitSize,
  layout,
  makeStyles,
  radius,
  spacing,
  typography,
  useTheme,
} from '@/theme';

/** Fraction of the viewport the "»" button advances the row by. */
const SCROLL_FORWARD_RATIO = 0.6;
/** Slack (px) so the button never flickers at the exact end of the row. */
const OVERFLOW_THRESHOLD = 4;
/** Grows the 40pt pill to the 44pt minimum touch target without changing width. */
const PILL_HIT_SLOP = { top: spacing.xxs, bottom: spacing.xxs };
/** How far past the icon the overflow touch target extends. */
const OVERFLOW_HIT_SLOP = spacing.sm;

interface PillLayout {
  x: number;
  width: number;
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  scroll: { flex: 1 },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pill: {
    height: layout.pillHeight,
    minWidth: hitSize.min,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: borderWidth.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillIdle: { backgroundColor: 'transparent', borderColor: c.primary },
  pillActive: { backgroundColor: c.primary, borderColor: c.primary },
  label: { ...typography.label, fontFamily: fontFamily.bold, fontWeight: '700' },
  overflowSlot: {
    width: layout.pillHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowButton: {
    width: layout.overflowButtonSize,
    height: layout.overflowButtonSize,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.chrome,
  },
}));

interface SectionPillProps {
  section: SectionTab;
  selected: boolean;
  onPress: (href: Href) => void;
  onMeasure: (key: string, pillLayout: PillLayout) => void;
}

/** A single outlined pill. Memoised so only the pill whose state changes redraws. */
const SectionPill = memo(function SectionPill({ section, selected, onPress, onMeasure }: SectionPillProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  const handlePress = useCallback(() => {
    if (!selected) onPress(section.href);
  }, [onPress, section.href, selected]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      onMeasure(section.key, { x, width });
    },
    [onMeasure, section.key],
  );

  return (
    <Touchable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={section.label}
      haptic="selection"
      scaleTo={0.96}
      hitSlop={PILL_HIT_SLOP}
      onPress={handlePress}
      onLayout={handleLayout}
      style={[styles.pill, selected ? styles.pillActive : styles.pillIdle]}
    >
      <Text style={[styles.label, { color: selected ? colors.onPrimary : colors.primaryDark }]} numberOfLines={1}>
        {section.label}
      </Text>
    </Touchable>
  );
});

/**
 * Horizontally scrollable section tabs shown under the app header. The active
 * pill is derived from the current route (never local state), the row
 * auto-centres the active pill, and a "»" button appears only while there is
 * more content to scroll to.
 */
export function SectionTabs() {
  const { colors } = useTheme();
  const styles = useStyles();
  const pathname = usePathname();
  const activeKey = activeSectionKey(pathname);

  const scrollRef = useRef<ScrollView>(null);
  const pillLayouts = useRef<Record<string, PillLayout>>({});
  const contentWidth = useRef(0);
  const viewportWidth = useRef(0);
  const scrollOffset = useRef(0);
  // Mirrors `activeKey` for callbacks that must not change identity on scroll.
  const activeKeyRef = useRef<string | null>(activeKey);
  activeKeyRef.current = activeKey;

  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateOverflow = useCallback(() => {
    const max = contentWidth.current - viewportWidth.current;
    const forward = max > OVERFLOW_THRESHOLD && scrollOffset.current < max - OVERFLOW_THRESHOLD;
    setCanScrollForward((previous) => (previous === forward ? previous : forward));
  }, []);

  const scrollToActive = useCallback(() => {
    const key = activeKeyRef.current;
    if (!key) return;
    const pill = pillLayouts.current[key];
    const viewport = viewportWidth.current;
    if (!pill || viewport === 0) return;
    const max = Math.max(0, contentWidth.current - viewport);
    const target = pill.x + pill.width / 2 - viewport / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, Math.min(target, max)), animated: true });
  }, []);

  const registerLayout = useCallback(
    (key: string, next: PillLayout) => {
      pillLayouts.current[key] = next;
      // The active pill is often measured before the outer layout event, so
      // re-centre it as soon as its position is known.
      if (key === activeKeyRef.current) scrollToActive();
    },
    [scrollToActive],
  );

  useEffect(() => {
    scrollToActive();
  }, [activeKey, scrollToActive]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewportWidth.current = event.nativeEvent.layout.width;
      updateOverflow();
    },
    [updateOverflow],
  );

  const handleContentSizeChange = useCallback(
    (width: number) => {
      contentWidth.current = width;
      updateOverflow();
    },
    [updateOverflow],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.x;
      updateOverflow();
    },
    [updateOverflow],
  );

  const handlePress = useCallback((href: Href) => {
    router.replace(href);
  }, []);

  const scrollForward = useCallback(() => {
    const viewport = viewportWidth.current;
    const max = Math.max(0, contentWidth.current - viewport);
    const next = Math.min(max, scrollOffset.current + viewport * SCROLL_FORWARD_RATIO);
    scrollRef.current?.scrollTo({ x: next, animated: true });
  }, []);

  return (
    <View style={styles.row}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {SECTIONS.map((section) => (
          <SectionPill
            key={section.key}
            section={section}
            selected={section.key === activeKey}
            onPress={handlePress}
            onMeasure={registerLayout}
          />
        ))}
      </ScrollView>

      <View style={styles.overflowSlot}>
        {canScrollForward ? (
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Show more sections"
            haptic="light"
            scaleTo={0.9}
            hitSlop={OVERFLOW_HIT_SLOP}
            onPress={scrollForward}
            style={styles.overflowButton}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.onChrome} />
          </Touchable>
        ) : null}
      </View>
    </View>
  );
}
