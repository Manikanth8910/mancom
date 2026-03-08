import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';

export function SuperadminSettingsScreen() {
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleSettingPress = (settingName: string) => {
        Alert.alert('Settings', `Configuring ${settingName}...`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Superadmin Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Platform Configuration</Text>
                    <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress('Global Maintenance')}>
                        <Text style={styles.settingText}>Global Maintenance Mode</Text>
                        <Text style={styles.settingValue}>Off</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress('API Keys')}>
                        <Text style={styles.settingText}>Manage API Keys</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress('Payment Gateways')}>
                        <Text style={styles.settingText}>Payment Gateways</Text>
                        <Text style={styles.settingValue}>Razorpay, Stripe</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security & Audit</Text>
                    <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress('Audit Logs')}>
                        <Text style={styles.settingText}>System Audit Logs</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem} onPress={() => handleSettingPress('Admin Access Levels')}>
                        <Text style={styles.settingText}>Admin Access Roles</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>Log Out from Superadmin</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    content: { padding: theme.spacing.lg },

    section: { marginBottom: theme.spacing.xl },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: theme.spacing.md, marginLeft: 4 },
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
    settingText: { fontSize: 16, color: theme.colors.text.primary },
    settingValue: { fontSize: 14, color: theme.colors.text.secondary },
    arrow: { fontSize: 20, color: theme.colors.text.disabled },

    logoutBtn: { marginTop: theme.spacing.xl, padding: theme.spacing.md, backgroundColor: '#FEF2F2', borderRadius: theme.borderRadius.md, alignItems: 'center' },
    logoutBtnText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.error }
});

export default SuperadminSettingsScreen;
