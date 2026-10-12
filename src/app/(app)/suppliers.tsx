import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Avatar, Badge, EmptyState, Header, ListItem, ScreenScroll, SearchBar, Section, StatTile } from '@/components/';
import { mockSuppliers } from '@/data/mock/suppliers';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';
import { formatCurrency, formatNumber } from '@/utils/format';

export default function SuppliersScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
      <Header title="Suppliers" subtitle="Local sample data" showBack />

      <ScreenScroll>
        <View style={styles.tileRow}>
          <StatTile
            label="Suppliers"
            value={formatNumber(totals.count)}
            tone="primary"
            icon={<Ionicons name="bus-outline" size={16} color={colors.primary} />}
          />
          <StatTile
            label="Total purchases"
            value={formatCurrency(totals.purchases)}
            icon={<Ionicons name="cash-outline" size={16} color={colors.textSecondary} />}
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
                  leading={<Avatar name={supplier.name} shape="square" size={40} />}
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

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  tileRow: { flexDirection: 'row', gap: spacing.md },
  list: { gap: spacing.sm },
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
