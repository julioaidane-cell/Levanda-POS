import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, EmptyState, Header, ListItem, ScreenScroll, Section, Select, StatTile } from '@/components/';
import { mockExpenses } from '@/data/mock/expenses';
import type { ExpenseCategory } from '@/types/modules';
import { useActiveShop } from '@/store/shopStore';
import { colors, radius, spacing, typography } from '@/theme';
import { formatCurrency, formatDate } from '@/utils/format';

const ALL: 'All' | ExpenseCategory = 'All';

export default function ExpensesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeShop = useActiveShop();
  const [category, setCategory] = useState<number>(ALL === 'All' ? -1 : 0);

  const categories = useMemo<ExpenseCategory[]>(
    () => ['Rent', 'Utilities', 'Salaries', 'Transport', 'Maintenance', 'Marketing', 'Other'],
    [],
  );

  const filtered = useMemo(
    () => (category === -1 ? mockExpenses : mockExpenses.filter((expense) => expense.category === categories[category])),
    [category, categories],
  );

  const total = useMemo(() => filtered.reduce((sum, expense) => sum + expense.amount, 0), [filtered]);

  const onRefresh = useCallback(() => {
    // Mock module: nothing to refetch, the list is static.
  }, []);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <Header
          title="Expenses"
          subtitle={activeShop?.name ?? 'All shops'}
          showShopSwitcher
          onAddShop={() => router.push('/shops/create')}
          onManageShops={() => router.push('/shops')}
        />
      </View>

      <ScreenScroll onRefresh={onRefresh}>
        <View style={styles.tileRow}>
          <StatTile
            label="Total expenses"
            value={formatCurrency(total)}
            tone="danger"
            icon={<Ionicons name="receipt-outline" size={13} color={colors.danger} />}
          />
          <StatTile
            label="Entries"
            value={String(filtered.length)}
            icon={<Ionicons name="list-outline" size={13} color={colors.textMuted} />}
          />
        </View>

        <Select
          label="Filter by category"
          value={category === -1 ? null : category}
          placeholder="All categories"
          options={[{ label: 'All categories', value: -1 }, ...categories.map((name, index) => ({ label: name, value: index }))]}
          onChange={setCategory}
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No expenses in this category"
            message="Try a different filter, or add your first expense."
            icon="receipt-outline"
          />
        ) : (
          <Section title="Recent expenses">
            <View style={styles.list}>
              {filtered.map((expense) => (
                <ListItem
                  key={expense.id}
                  title={expense.title}
                  subtitle={`${expense.category} · ${formatDate(expense.date)}`}
                  meta={formatCurrency(expense.amount)}
                  badge={{ label: expense.category, tone: 'warning' }}
                  leading={
                    <View style={styles.icon}>
                      <Ionicons name="receipt-outline" size={17} color={colors.warning} />
                    </View>
                  }
                />
              ))}
            </View>
          </Section>
        )}

        <View style={styles.notice}>
          <Badge label="Sample data" tone="neutral" icon="flask-outline" />
          <Text style={styles.noticeText}>
            Expenses are not yet connected to the Levanda API, so this screen shows local sample data.
          </Text>
        </View>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tileRow: { flexDirection: 'row', gap: spacing.md },
  list: { gap: spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warningTint,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  noticeText: { ...typography.caption, color: colors.textMuted, flex: 1 },
});