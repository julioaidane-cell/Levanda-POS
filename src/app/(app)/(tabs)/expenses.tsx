import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Badge, Chip, EmptyState, ListItem, ScreenHeader, ScreenScroll, Section, StatTile } from '@/components/';
import { mockExpenses } from '@/data/mock/expenses';
import type { ExpenseCategory } from '@/types/modules';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';
import { formatCurrency, formatDate } from '@/utils/format';

const ALL = -1;

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [category, setCategory] = useState<number>(ALL);

  const categories = useMemo<ExpenseCategory[]>(
    () => ['Rent', 'Utilities', 'Salaries', 'Transport', 'Maintenance', 'Marketing', 'Other'],
    [],
  );

  const filtered = useMemo(
    () => (category === ALL ? mockExpenses : mockExpenses.filter((expense) => expense.category === categories[category])),
    [category, categories],
  );

  const total = useMemo(() => filtered.reduce((sum, expense) => sum + expense.amount, 0), [filtered]);

  const onRefresh = useCallback(() => {
    // Mock module: nothing to refetch, the list is static.
  }, []);

  return (
    <View style={styles.root}>
      <ScreenHeader />

      <ScreenScroll onRefresh={onRefresh}>
        <View style={styles.tileRow}>
          <StatTile
            label="Total expenses"
            value={formatCurrency(total)}
            tone="danger"
            icon={<Ionicons name="receipt-outline" size={16} color={colors.danger} />}
          />
          <StatTile
            label="Entries"
            value={String(filtered.length)}
            icon={<Ionicons name="list-outline" size={16} color={colors.textSecondary} />}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          keyboardShouldPersistTaps="handled"
        >
          <Chip label="All" active={category === ALL} onPress={() => setCategory(ALL)} />
          {categories.map((name, index) => (
            <Chip key={name} label={name} active={category === index} onPress={() => setCategory(index)} />
          ))}
        </ScrollView>

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

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  tileRow: { flexDirection: 'row', gap: spacing.md },
  filters: { gap: spacing.sm, paddingVertical: spacing.xxs },
  list: { gap: spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.warningTint,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: c.surfaceMuted,
  },
  noticeText: { ...typography.caption, color: c.textMuted, flex: 1 },
}));
