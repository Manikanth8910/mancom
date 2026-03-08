/**
 * Superadmin Tab Navigator
 * Bottom tab navigation for Super Admins managing instances
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { SuperadminDashboardScreen } from '../screens/superadmin/SuperadminDashboardScreen';
import { SuperadminSocietiesScreen } from '../screens/superadmin/SuperadminSocietiesScreen';
import { SuperadminUsersScreen } from '../screens/superadmin/SuperadminUsersScreen';
import { SuperadminSettingsScreen } from '../screens/superadmin/SuperadminSettingsScreen';
import type { SuperadminTabParamList } from '../types/navigation';
import { theme } from '../config/theme';

const Tab = createBottomTabNavigator<SuperadminTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    return (
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
            {label}
        </Text>
    );
}

export function SuperadminTabs() {
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
                name="SuperadminDashboard"
                component={SuperadminDashboardScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="🌍" focused={focused} />,
                    tabBarLabel: 'Metrics',
                }}
            />
            <Tab.Screen
                name="SuperadminSocieties"
                component={SuperadminSocietiesScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="🏢" focused={focused} />,
                    tabBarLabel: 'Societies',
                }}
            />
            <Tab.Screen
                name="SuperadminUsers"
                component={SuperadminUsersScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
                    tabBarLabel: 'Users',
                }}
            />
            <Tab.Screen
                name="SuperadminSettings"
                component={SuperadminSettingsScreen}
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
        backgroundColor: '#1E1B4B', // Distinct dark color for Superadmin
        borderTopWidth: 1,
        borderTopColor: '#312E81',
        paddingTop: theme.spacing.xs,
        height: 60,
    },
    tabLabel: {
        fontSize: theme.fontSize.xs,
        marginBottom: theme.spacing.xs,
        fontWeight: theme.fontWeight.bold,
        color: '#E0E7FF'
    },
    tabIcon: {
        fontSize: 20,
        opacity: 0.5,
    },
    tabIconFocused: {
        opacity: 1,
    },
});

export default SuperadminTabs;
