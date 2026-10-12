import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Touchable } from './Touchable';
import { elevation, makeStyles, radius, spacing, typography, useReduceMotion, useTheme } from '@/theme';

export interface SelectOption {
  label: string;
  value: number;
  /** Optional secondary line, e.g. a region's post code. */
  meta?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Shows a search field inside the sheet — useful for long lists. */
  searchable?: boolean;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
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
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  fieldError: { borderColor: c.danger },
  fieldDisabled: { opacity: 0.6, backgroundColor: c.surfaceMuted },
  value: { flex: 1, ...typography.body, color: c.text },
  valuePlaceholder: { color: c.textDisabled },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  errorText: { ...typography.caption, color: c.danger, flex: 1 },
  hintText: { ...typography.caption, color: c.textMuted },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: c.overlay },
  sheet: {
    backgroundColor: c.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '80%',
    ...elevation.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: c.borderStrong,
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheetTitle: { ...typography.heading, color: c.text },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  searchInput: { flex: 1, ...typography.body, color: c.text, paddingVertical: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionTextWrap: { flex: 1, gap: 2 },
  optionLabel: { ...typography.body, color: c.text },
  optionLabelSelected: { color: c.primary, fontWeight: '600' },
  optionMeta: { ...typography.caption, color: c.textMuted },
  sheetEmpty: { padding: spacing.xxl, alignItems: 'center' },
  sheetEmptyText: { ...typography.body, color: c.textMuted },
}));

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  hint,
  required,
  loading = false,
  disabled = false,
  searchable = false,
  emptyMessage = 'No options available.',
  style,
}: SelectProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const reduceMotion = useReduceMotion();
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!searchable || trimmed.length === 0) return options;
    return options.filter((option) => option.label.toLowerCase().includes(trimmed));
  }, [options, query, searchable]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const handleSelect = (next: number) => {
    onChange(next);
    close();
  };

  const isInactive = disabled || loading;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <Touchable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled: isInactive, expanded: open }}
        disabled={isInactive}
        haptic="selection"
        scaleTo={0.99}
        onPress={() => setOpen(true)}
        style={[styles.field, !!error && styles.fieldError, isInactive && styles.fieldDisabled]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            <Text numberOfLines={1} style={[styles.value, !selected && styles.valuePlaceholder]}>
              {selected?.label ?? placeholder}
            </Text>
          </>
        )}
      </Touchable>

      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
        <View style={styles.modalRoot}>
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={styles.backdrop}>
            <Touchable
              accessibilityRole="button"
              accessibilityLabel="Close"
              haptic="none"
              onPress={close}
              style={{ flex: 1 }}
            />
          </Animated.View>

          <Animated.View
            entering={reduceMotion ? undefined : SlideInDown.duration(280)}
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          >
            <View style={styles.grabber} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label ?? 'Select'}</Text>
              <Touchable accessibilityRole="button" accessibilityLabel="Close" haptic="none" hitSlop={12} onPress={close}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Touchable>
            </View>

            {searchable ? (
              <View style={styles.searchField}>
                <Ionicons name="search" size={16} color={colors.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search…"
                  placeholderTextColor={colors.textDisabled}
                  selectionColor={colors.primary}
                  style={styles.searchInput}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {query.length > 0 ? (
                  <Touchable accessibilityRole="button" accessibilityLabel="Clear search" haptic="none" onPress={() => setQuery('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textDisabled} />
                  </Touchable>
                ) : null}
              </View>
            ) : null}

            {filtered.length === 0 ? (
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetEmptyText}>{emptyMessage}</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.value)}
                keyboardShouldPersistTaps="handled"
                style={{ flexGrow: 0 }}
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <Touchable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={item.label}
                      haptic="selection"
                      scaleTo={0.99}
                      onPress={() => handleSelect(item.value)}
                      style={styles.option}
                    >
                      <View style={styles.optionTextWrap}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{item.label}</Text>
                        {item.meta ? <Text style={styles.optionMeta}>{item.meta}</Text> : null}
                      </View>
                      {isSelected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                    </Touchable>
                  );
                }}
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
