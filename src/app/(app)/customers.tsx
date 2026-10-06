import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, EmptyState, Header, ListItem, ScreenScroll, SearchBar, Section, StatTile } from '@/components/';
import { mockCustomers } from '@/data/mock/customers';
import { colors, radius, spacing, typography } from '@/theme';
import { formatCurrency, formatDate, formatNumber } from '@/utils/format';

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length === 0) return mockCustomers;
    return mockCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(trimmed) || customer.phone.toLowerCase().includes(trimmed),
    );
  }, [query]);

  const totals = useMemo(
    () => ({
      count: mockCustomers.length,
      spent: mockCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0),
      orders: mockCustomers.reduce((sum, customer) => sum + customer.orders, 0),
    }),
    [],
  );

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <Header title="Customers" subtitle="Local sample data" showBack />
      </View>

      <ScreenScroll>
        <View style={styles.tileRow}>
          <StatTile
            label="Customers"
            value={formatNumber(totals.count)}
            tone="primary"
            icon={<Ionicons name="people-outline" size={13} color={colors.primary} />}
          />
          <StatTile
            label="Total spent"
            value={formatCurrency(totals.spent)}
            icon={<Ionicons name="cash-outline" size={13} color={colors.textMuted} />}
          />
          <StatTile
            label="Orders"
            value={formatNumber(totals.orders)}
            icon={<Ionicons name="receipt-outline" size={13} color={colors.textMuted} />}
          />
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Search customers…" />

        {filtered.length === 0 ? (
          <EmptyState
            title="No customers found"
            message={query.trim().length > 0 ? 'Try a different search term.' : 'No customers have been added yet.'}
            icon="people-outline"
          />
        ) : (
          <Section title={`${filtered.length} customer${filtered.length === 1 ? '' : 's'}`}>
            <View style={styles.list}>
              {filtered.map((customer) => (
                <ListItem
                  key={customer.id}
                  title={customer.name}
                  subtitle={`${customer.phone} · last visit ${formatDate(customer.lastVisit)}`}
                  meta={formatCurrency(customer.totalSpent)}
                  metaCaption={`${formatNumber(customer.orders)} orders`}
                  badge={{ label: customer.status, tone: customer.status === 'Active' ? 'success' : 'primary' }}
                  leading={
                    <View style={styles.icon}>
                      <Ionicons name="person-outline" size={17} color={colors.primaryDark} />
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
            Customers have no Levanda API endpoint yet, so this screen shows local sample data.
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
    backgroundColor: colors.primaryTint,
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