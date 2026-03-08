import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { logout, setUserMode } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';

export function SuperadminDashboardScreen() {
    const dispatch = useAppDispatch();

    const stats = [
        { label: 'Total Societies', value: '142', emoji: '🏢' },
        { label: 'Active Users', value: '45.2K', emoji: '👥' },
        { label: 'MRR (Mar)', value: '₹12.5L', emoji: '📈' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Superadmin Access</Text>
                    <Text style={styles.subtitle}>System-wide Overview</Text>
                </View>
                <TouchableOpacity onPress={() => dispatch(logout())} style={styles.logoutBtn}>
                    <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.statsRow}>
                    {stats.map((stat, idx) => (
                        <View key={idx} style={styles.statCard}>
                            <Text style={styles.statEmoji}>{stat.emoji}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.card, { marginTop: theme.spacing.lg }]}>
                    <Text style={styles.sectionTitle}>Global Alerts</Text>
                    <View style={styles.alertItem}>
                        <Text style={styles.alertIcon}>⚠️</Text>
                        <View>
                            <Text style={styles.alertText}>SMS Provider Quota Low</Text>
                            <Text style={styles.alertSub}>Twilio balance under $50</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.switchBtn} onPress={() => dispatch(setUserMode())}>
                    <Text style={styles.switchBtnText}>Exit Superadmin View</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    subtitle: { fontSize: 13, color: theme.colors.text.secondary },
    logoutBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    logoutBtnText: { color: theme.colors.error, fontWeight: theme.fontWeight.bold, fontSize: 12 },

    content: { padding: theme.spacing.lg },

    statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
    statCard: { flex: 1, backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
    statEmoji: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 18, fontWeight: theme.fontWeight.bold, color: theme.colors.primary, marginBottom: 4 },
    statLabel: { fontSize: 11, color: theme.colors.text.secondary, textAlign: 'center' },

    card: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border },
    sectionTitle: { fontSize: 16, fontWeight: theme.fontWeight.bold, marginBottom: theme.spacing.lg },

    alertItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: theme.spacing.md, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.warning },
    alertIcon: { fontSize: 24, marginRight: theme.spacing.md },
    alertText: { fontSize: 14, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    alertSub: { fontSize: 12, color: theme.colors.text.secondary },

    switchBtn: { backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.lg, paddingVertical: 16, alignItems: 'center', marginTop: theme.spacing.xxl },
    switchBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
});
