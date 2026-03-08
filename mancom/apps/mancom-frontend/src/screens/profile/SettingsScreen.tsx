import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

interface SettingsRowProps {
    icon: string;
    label: string;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    rightText?: string;
    onPress?: () => void;
    danger?: boolean;
    activeColors: any;
}

const SettingsRow = ({ icon, label, hasSwitch, switchValue, onSwitchChange, rightText, onPress, danger, activeColors }: SettingsRowProps) => (
    <TouchableOpacity
        style={styles.settingsRow}
        onPress={hasSwitch ? () => onSwitchChange && onSwitchChange(!switchValue) : onPress}
        disabled={!onPress && !hasSwitch}
        activeOpacity={hasSwitch ? 1 : 0.7}
    >
        <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>{icon}</Text>
            <Text style={[styles.rowLabel, { color: danger ? activeColors.error : activeColors.text.primary }]} numberOfLines={1}>{label}</Text>
        </View>
        {hasSwitch ? (
            <View style={styles.switchWrapper}>
                <View pointerEvents="none">
                    <Switch
                        value={switchValue}
                        onValueChange={onSwitchChange}
                        trackColor={{ false: activeColors.border, true: activeColors.primary }}
                        thumbColor={activeColors.surface}
                    />
                </View>
            </View>
        ) : (
            <View style={styles.rowRight}>
                {rightText && <Text style={[styles.rightText, { color: activeColors.text.secondary }]}>{rightText}</Text>}
                {!danger && <Text style={[styles.chevron, { color: activeColors.text.disabled }]}>›</Text>}
            </View>
        )}
    </TouchableOpacity>
);

export function SettingsScreen() {
    const navigation = useNavigation();

    // Mock State for Settings Toggles
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);
    const [biometrics, setBiometrics] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    // Derived Dynamic Theme Colors for Settings Screen
    const activeColors = isDarkMode ? {
        background: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        primary: theme.colors.primary,
        error: theme.colors.error,
        text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
            disabled: '#475569'
        }
    } : theme.colors;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: activeColors.text.primary }]}>Settings</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content}>

                <Text style={[styles.sectionTitle, { color: activeColors.text.secondary }]}>App Preferences</Text>
                <View style={[styles.settingsGroup, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
                    <SettingsRow
                        icon="🔤"
                        label="Language"
                        rightText="English (US)"
                        onPress={() => Alert.alert('Coming Soon', 'Language selection will be added here.')}
                        activeColors={activeColors}
                    />
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <SettingsRow
                        icon="🌗"
                        label="Dark Theme"
                        hasSwitch
                        switchValue={isDarkMode}
                        onSwitchChange={setIsDarkMode}
                        activeColors={activeColors}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: activeColors.text.secondary }]}>Notifications</Text>
                <View style={[styles.settingsGroup, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
                    <SettingsRow
                        icon="🔔"
                        label="Push Notifications"
                        hasSwitch
                        switchValue={pushNotifications}
                        onSwitchChange={setPushNotifications}
                        activeColors={activeColors}
                    />
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <SettingsRow
                        icon="✉️"
                        label="Email Alerts"
                        hasSwitch
                        switchValue={emailAlerts}
                        onSwitchChange={setEmailAlerts}
                        activeColors={activeColors}
                    />
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <SettingsRow
                        icon="🔇"
                        label="Do Not Disturb"
                        rightText="Off"
                        onPress={() => Alert.alert('Coming Soon', 'DND settings will be available soon.')}
                        activeColors={activeColors}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: activeColors.text.secondary }]}>Security & Access</Text>
                <View style={[styles.settingsGroup, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
                    <SettingsRow
                        icon="🛡️"
                        label="Biometric Login / FaceID"
                        hasSwitch
                        switchValue={biometrics}
                        onSwitchChange={setBiometrics}
                        activeColors={activeColors}
                    />
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <SettingsRow
                        icon="🔐"
                        label="Two-Factor Auth (2FA)"
                        hasSwitch
                        switchValue={twoFactor}
                        onSwitchChange={setTwoFactor}
                        activeColors={activeColors}
                    />
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <SettingsRow
                        icon="🔑"
                        label="Change Passcode"
                        onPress={() => Alert.alert('Change Passcode', 'Redirect to passcode change flow.')}
                        activeColors={activeColors}
                    />
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <SettingsRow
                        icon="📱"
                        label="Active Devices"
                        rightText="1 Device"
                        onPress={() => Alert.alert('Active Devices', 'Manage your logged-in devices.')}
                        activeColors={activeColors}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: activeColors.text.secondary }]}>Data Privacy</Text>
                <View style={[styles.settingsGroup, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
                    <SettingsRow
                        icon="📍"
                        label="Location Access"
                        rightText="While Using"
                        onPress={() => Alert.alert('Location', 'Update location permissions.')}
                        activeColors={activeColors}
                    />
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <SettingsRow
                        icon="📊"
                        label="Analytics Sharing"
                        rightText="On"
                        onPress={() => Alert.alert('Analytics', 'Toggle usage data sharing.')}
                        activeColors={activeColors}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: activeColors.text.secondary }]}>Account</Text>
                <View style={[styles.settingsGroup, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
                    <SettingsRow
                        icon="🗑️"
                        label="Delete Account"
                        danger
                        onPress={() => Alert.alert('Delete Account', 'Are you sure you want to permanently delete your account?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive' }
                        ])}
                        activeColors={activeColors}
                    />
                </View>

                <Text style={[styles.versionText, { color: activeColors.text.disabled }]}>ManCom App v1.0.0 (Build 42)</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1 },
    backButton: { width: 60 },
    backButtonText: { fontSize: 16, color: theme.colors.primary },
    title: { fontSize: 20, fontWeight: theme.fontWeight.bold },

    content: { flex: 1, padding: theme.spacing.lg },
    sectionTitle: { fontSize: 13, fontWeight: theme.fontWeight.bold, textTransform: 'uppercase', marginBottom: theme.spacing.sm, marginTop: theme.spacing.md, letterSpacing: 0.5 },

    settingsGroup: { borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg, borderWidth: 1 },
    settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: theme.spacing.md },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    rowIcon: { fontSize: 20, width: 36 },
    rowLabel: { fontSize: 15, fontWeight: '500', flex: 1, paddingRight: 8 },
    switchWrapper: { width: 50, alignItems: 'flex-end', justifyContent: 'center' },
    rowRight: { flexDirection: 'row', alignItems: 'center' },
    rightText: { fontSize: 14, marginRight: 8 },
    chevron: { fontSize: 20, paddingBottom: 2 },
    divider: { height: 1, marginLeft: 50 },
    versionText: { textAlign: 'center', marginTop: theme.spacing.sm, fontSize: 12, marginBottom: 20 }
});
