/**
 * Security Tab Navigator
 * Bottom tab navigation for Security personnel
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { SecurityGateScreen } from '../screens/security/SecurityGateScreen';
import { SecurityLogsScreen } from '../screens/security/SecurityLogsScreen';
import { SecurityResidentsScreen } from '../screens/security/SecurityResidentsScreen';
import { SecurityProfileScreen } from '../screens/security/SecurityProfileScreen';
import type { SecurityTabParamList } from '../types/navigation';
import { theme } from '../config/theme';

const Tab = createBottomTabNavigator<SecurityTabParamList>();

// Simple text-based tab icon
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    return (
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
            {label}
        </Text>
    );
}

export function SecurityTabs() {
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
                name="SecurityGate"
                component={SecurityGateScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="🛡️" focused={focused} />,
                    tabBarLabel: 'Gate',
                }}
            />
            <Tab.Screen
                name="SecurityLogs"
                component={SecurityLogsScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
                    tabBarLabel: 'Logs',
                }}
            />
            <Tab.Screen
                name="SecurityResidents"
                component={SecurityResidentsScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
                    tabBarLabel: 'Residents',
                }}
            />
            <Tab.Screen
                name="SecurityProfile"
                component={SecurityProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
                    tabBarLabel: 'Profile',
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

export default SecurityTabs;
