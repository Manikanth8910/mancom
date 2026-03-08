import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../../config/theme';

export function AdminFinancesScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Finances</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Upcoming Due</Text>
                    <Text style={styles.cardAmount}>₹0</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Total Collected (Current Month)</Text>
                    <Text style={[styles.cardAmount, { color: theme.colors.success }]}>₹0</Text>
                </View>
                <Text style={styles.subtext}>Detailed reports coming soon.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.sm },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    content: { padding: theme.spacing.lg },
    card: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    cardTitle: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: 8 },
    cardAmount: { fontSize: 28, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    subtext: { textAlign: 'center', marginTop: theme.spacing.xl, color: theme.colors.text.disabled }
});
