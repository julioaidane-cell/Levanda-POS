import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { makeStyles, typography, useTheme } from '@/theme';

type IconProps = { color: ColorValue; size: number; focused: boolean };

const useStyles = makeStyles((c) => ({
  tabBar: {
    backgroundColor: c.chrome,
    borderTopColor: c.chromeBorder,
    borderTopWidth: 1,
  },
  tabItem: { paddingTop: 6 },
  tabLabel: { ...typography.caption, fontSize: 11, fontWeight: '600' },
}));

/**
 * Bottom tabs replace the web sidebar. The bar keeps the near-black chrome and
 * teal active tint measured from the Levanda POS screenshots.
 */
export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primarySoft,
        tabBarInactiveTintColor: colors.chromeMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: IconProps) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }: IconProps) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shops/index"
        options={{
          title: 'Shops',
          tabBarIcon: ({ color, size }: IconProps) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }: IconProps) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
