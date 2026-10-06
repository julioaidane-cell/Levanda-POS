import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, EmptyState, Header, ListItem, ScreenScroll, SearchBar, Section, StatTile } from '@/components/';
import { mockSuppliers } from '@/data/mock/suppliers';
import { colors, radius, spacing, typography } from '@/theme';
import { formatCurrency, formatNumber } from '@/utils/format';

export default function SuppliersScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length === 0) return mockSuppliers;
    return mockSuppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(trimmed) || supplier.contactPerson.toLowerCase().includes(trimmed),
    );
  }, [query]);

  const totals = useMemo(
    () => ({
      count: mockSuppliers.length,
      purchases: mockSuppliers.reduce((sum, supplier) => sum + supplier.totalPurchases, 0),
    }),
    [],
  );

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <Header title="Suppliers" subtitle="Local sample data" showBack />
      </View>

      <ScreenScroll>
        <View style={styles.tileRow}>
          <StatTile
            label="Suppliers"
            value={formatNumber(totals.count)}
            tone="primary"
            icon={<Ionicons name="bus-outline" size={13} color={colors.primary} />}
          />
          <StatTile
            label="Total purchases"
            value={formatCurrency(totals.purchases)}
            icon={<Ionicons name="cash-outline" size={13} color={colors.textMuted} />}
          />
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Search suppliers…" />

        {filtered.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            message={query.trim().length > 0 ? 'Try a different search term.' : 'No suppliers have been added yet.'}
            icon="bus-outline"
          />
        ) : (
          <Section title={`${filtered.length} supplier${filtered.length === 1 ? '' : 's'}`}>
            <View style={styles.list}>
              {filtered.map((supplier) => (
                <ListItem
                  key={supplier.id}
                  title={supplier.name}
                  subtitle={`${supplier.contactPerson} · ${supplier.phone}`}
                  meta={formatCurrency(supplier.totalPurchases)}
                  badge={{ label: supplier.status, tone: supplier.status === 'Active' ? 'success' : 'warning' }}
                  leading={
                    <View style={styles.icon}>
                      <Ionicons name="bus-outline" size={17} color={colors.primaryDark} />
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
            Suppliers have no Levanda API endpoint yet, so this screen shows local sample data.
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