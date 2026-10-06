import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, elevation, hitSize, layout, radius, spacing, typography } from '@/theme';

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
}

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
}: SelectProps) {
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
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled: isInactive, expanded: open }}
        disabled={isInactive}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          !!error && styles.fieldError,
          isInactive && styles.fieldDisabled,
          pressed && !isInactive && styles.fieldPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            <Text
              numberOfLines={1}
              style={[styles.value, !selected && styles.valuePlaceholder]}
            >
              {selected?.label ?? placeholder}
            </Text>
          </>
        )}
      </Pressable>

      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label ?? 'Select'}</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {searchable ? (
            <View style={styles.searchField}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search…"
                placeholderTextColor={colors.textDisabled}
                style={styles.searchInput}
                autoCorrect={false}
              />
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
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleSelect(item.value)}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {item.label}
                      </Text>
                      {item.meta ? <Text style={styles.optionMeta}>{item.meta}</Text> : null}
                    </View>
                    {isSelected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textSecondary },
  required: { color: colors.danger },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: hitSize.control,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldPressed: { borderColor: colors.primarySoft },
  fieldError: { borderColor: colors.danger, backgroundColor: colors.dangerTint },
  fieldDisabled: { opacity: 0.6, backgroundColor: colors.surfaceMuted },
  value: { flex: 1, ...typography.body, color: colors.text },
  valuePlaceholder: { color: colors.textDisabled },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  errorText: { ...typography.caption, color: colors.danger, flex: 1 },
  hintText: { ...typography.caption, color: colors.textMuted },

  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: layout.tabBarHeight,
    maxHeight: '78%',
    ...elevation.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheetTitle: { ...typography.heading, color: colors.text },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  list: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: hitSize.min + 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionPressed: { backgroundColor: colors.surfaceMuted },
  optionTextWrap: { flex: 1, gap: 2 },
  optionLabel: { ...typography.body, color: colors.text },
  optionLabelSelected: { color: colors.primaryDark, fontWeight: '600' },
  optionMeta: { ...typography.caption, color: colors.textMuted },
  sheetEmpty: { padding: spacing.xxl, alignItems: 'center' },
  sheetEmptyText: { ...typography.body, color: colors.textMuted },
});