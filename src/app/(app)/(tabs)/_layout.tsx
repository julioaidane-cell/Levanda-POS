import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { makeStyles, typography, useTheme } from '@/theme';

type IconProps = { color: ColorValue; size: number; focused: boolean };

const useStyles = makeStyles((c) => ({
  tabBar: {
    backgroundColor: c.tabBarBackground,
    borderTopColor: c.tabBarBorder,
    borderTopWidth: 1,
  },
  tabItem: { paddingTop: 6 },
  tabLabel: { ...typography.caption, fontSize: 11, fontWeight: '600' },
}));

/**
 * Bottom tabs replace the web sidebar. The bar is theme-aware: a light surface
 * with dark labels in light mode, a raised dark surface in dark mode, with the
 * brand teal marking the active tab.
 */
export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = useStyles();
  const tabIconColor = (color: ColorValue, focused: boolean) =>
    typeof color === 'string' ? color : focused ? colors.tabIconActive : colors.tabIconInactive;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconActive,
        tabBarInactiveTintColor: colors.tabIconInactive,
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
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={tabIconColor(color, focused)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <Ionicons
              name="cube-outline"
              size={size}
              color={tabIconColor(color, focused)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shops/index"
        options={{
          title: 'Shops',
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <Ionicons
              name="storefront-outline"
              size={size}
              color={tabIconColor(color, focused)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <Ionicons
              name="receipt-outline"
              size={size}
              color={tabIconColor(color, focused)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <Ionicons
              name="ellipsis-horizontal-circle-outline"
              size={size}
              color={tabIconColor(color, focused)}
            />
          ),
        }}
      />

      {/*
        Section routes reachable from the pill row but intentionally kept out of
        the bottom bar. `href: null` hides the button while keeping the screen in
        this navigator, so the bottom bar and shared header stay mounted.
      */}
      <Tabs.Screen name="sell" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="sales-reports" options={{ href: null }} />
      <Tabs.Screen name="customers" options={{ href: null }} />
      <Tabs.Screen name="suppliers" options={{ href: null }} />
    </Tabs>
  );
}
