/**
 * Main Tab Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { VisitorsScreen } from '../screens/visitors/VisitorsScreen';
import { PaymentsScreen } from '../screens/payments/PaymentsScreen';
import { HelpdeskScreen } from '../screens/helpdesk/HelpdeskScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { CommunityScreen } from '../screens/community/CommunityScreen';
import type { MainTabParamList } from './types';
import { theme } from '../config/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple text-based tab icon (wireframe style)
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {label}
    </Text>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🏢" focused={focused} />,
          tabBarLabel: 'Hub',
        }}
      />
      <Tab.Screen
        name="Visitors"
        component={VisitorsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
          tabBarLabel: 'Visit',
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="💰" focused={focused} />,
          tabBarLabel: 'Pay',
        }}
      />
      <Tab.Screen
        name="Helpdesk"
        component={HelpdeskScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🎫" focused={focused} />,
          tabBarLabel: 'Help',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
          tabBarLabel: 'Me',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xs,
    height: 60,
  },
  tabLabel: {
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing.xs,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

export default MainTabs;
