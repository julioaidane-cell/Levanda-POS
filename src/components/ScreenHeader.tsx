import { router } from 'expo-router';
import { View } from 'react-native';

import { AppHeader, type AppHeaderProps } from './AppHeader';
import { SectionTabs } from './SectionTabs';
import { makeStyles } from '@/theme';

export interface ScreenHeaderProps {
  /** Renders the section-tab pill row under the app header (on by default). */
  showTabs?: boolean;
  onAddShop?: AppHeaderProps['onAddShop'];
  onManageShops?: AppHeaderProps['onManageShops'];
  onPressNotifications?: AppHeaderProps['onPressNotifications'];
  onPressAvatar?: AppHeaderProps['onPressAvatar'];
}

/* Stable defaults so the header does not recreate handlers on every render. */
const openCreateShop = () => router.push('/shops/create');
const openManageShops = () => router.push('/shops');
const openNotifications = () => router.push('/notifications');
const openAccount = () => router.push('/more');

const useStyles = makeStyles((c) => ({
  container: {
    backgroundColor: c.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
}));

/**
 * Shared, sticky chrome for every main screen: {@link AppHeader} (shop switcher,
 * notification bell, avatar) plus the {@link SectionTabs} pill row. Rendering it
 * above the screen's scroll view keeps both pinned while content scrolls.
 */
export function ScreenHeader({
  showTabs = true,
  onAddShop = openCreateShop,
  onManageShops = openManageShops,
  onPressNotifications = openNotifications,
  onPressAvatar = openAccount,
}: ScreenHeaderProps) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <AppHeader
        onAddShop={onAddShop}
        onManageShops={onManageShops}
        onPressNotifications={onPressNotifications}
        onPressAvatar={onPressAvatar}
      />
      {showTabs ? <SectionTabs /> : null}
    </View>
  );
}
