import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

export function AdminSettingsScreen() {
    const navigation = useNavigation();

    const SettingsRow = ({ icon, label, hasSwitch, value, onPress, danger }: any) => (
        <TouchableOpacity style={styles.settingsRow} onPress={onPress} disabled={!onPress}>
            <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>{icon}</Text>
                <Text style={[styles.rowLabel, { color: danger ? theme.colors.error : theme.colors.text.primary }]}>{label}</Text>
            </View>
            {hasSwitch ? (
                <Switch value={value} />
            ) : (
                <Text style={styles.chevron}>›</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Society Settings</Text>
                <View style={{ width: 60 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.settingsGroup}>
                    <SettingsRow icon="🏢" label="Update Society Profile" onPress={() => Alert.alert('Coming Soon')} />
                    <View style={styles.divider} />
                    <SettingsRow icon="🏦" label="Bank Details" onPress={() => Alert.alert('Coming Soon')} />
                </View>

                <Text style={styles.sectionTitle}>Automations</Text>
                <View style={styles.settingsGroup}>
                    <SettingsRow icon="🧾" label="Auto-Generate Invoices (1st of Month)" hasSwitch value={true} />
                    <View style={styles.divider} />
                    <SettingsRow icon="🔔" label="Late Payment Reminders" hasSwitch value={true} />
                </View>

                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={[styles.settingsGroup, { borderColor: theme.colors.error }]}>
                    <SettingsRow icon="🗑️" label="Delete Society Data" danger onPress={() => Alert.alert('Warning', 'This action cannot be undone.')} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg, borderBottomWidth: 1, borderColor: theme.colors.border },
    backButton: { width: 60 },
    backBtnText: { color: theme.colors.primary, fontSize: 16 },
    title: { fontSize: 18, fontWeight: theme.fontWeight.bold },
    content: { padding: theme.spacing.lg },

    sectionTitle: { fontSize: 13, fontWeight: theme.fontWeight.bold, textTransform: 'uppercase', marginBottom: theme.spacing.sm, marginTop: theme.spacing.md, letterSpacing: 0.5, color: theme.colors.text.secondary },
    settingsGroup: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
    settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: theme.spacing.md },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    rowIcon: { fontSize: 20, width: 36 },
    rowLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
    chevron: { fontSize: 20, color: theme.colors.text.disabled, paddingBottom: 2 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 50 },
});
