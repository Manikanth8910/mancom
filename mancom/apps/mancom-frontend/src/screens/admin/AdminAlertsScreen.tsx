import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../../config/theme';

export function AdminAlertsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>System Alerts</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.alertCard, { borderColor: theme.colors.error }]}>
                    <Text style={styles.alertIcon}>🚨</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>False Fire Alarm in Wing A</Text>
                        <Text style={styles.alertTime}>Just now</Text>
                    </View>
                </View>
                <View style={[styles.alertCard, { borderColor: theme.colors.warning }]}>
                    <Text style={styles.alertIcon}>🔧</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Lift #2 broken</Text>
                        <Text style={styles.alertTime}>2 hours ago</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.sm },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    content: { padding: theme.spacing.lg },
    alertCard: { backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, borderWidth: 1 },
    alertIcon: { fontSize: 28, marginRight: theme.spacing.md },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    alertTime: { fontSize: 12, color: theme.colors.text.secondary }
});
