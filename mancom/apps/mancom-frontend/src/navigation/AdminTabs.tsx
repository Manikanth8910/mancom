/**
 * Admin Tab Navigator
 * Bottom tab navigation for Admin users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/admin/DashboardScreen';
import { AdminFinancesScreen } from '../screens/admin/AdminFinancesScreen';
import { AdminAlertsScreen } from '../screens/admin/AdminAlertsScreen';
import { AdminSettingsScreen } from '../screens/admin/AdminSettingsScreen';
import type { AdminTabParamList } from '../types/navigation';
import { theme } from '../config/theme';

const Tab = createBottomTabNavigator<AdminTabParamList>();

// Simple text-based tab icon
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    return (
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
            {label}
        </Text>
    );
}

export function AdminTabs() {
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
                name="AdminOverview"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="📊" focused={focused} />,
                    tabBarLabel: 'Overview',
                }}
            />
            <Tab.Screen
                name="AdminFinances"
                component={AdminFinancesScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="💳" focused={focused} />,
                    tabBarLabel: 'Finances',
                }}
            />
            <Tab.Screen
                name="AdminAlerts"
                component={AdminAlertsScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="🚨" focused={focused} />,
                    tabBarLabel: 'Alerts',
                }}
            />
            <Tab.Screen
                name="AdminSettings"
                component={AdminSettingsScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} />,
                    tabBarLabel: 'Settings',
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.xs,
        height: 60,
    },
    tabLabel: {
        fontSize: theme.fontSize.xs,
        marginBottom: theme.spacing.xs,
        fontWeight: theme.fontWeight.medium,
    },
    tabIcon: {
        fontSize: 20,
        opacity: 0.6,
    },
    tabIconFocused: {
        opacity: 1,
    },
});

export default AdminTabs;
