import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { theme } from '../../config/theme';

export function SecurityLogsScreen() {
    const logs = [
        { id: '1', name: 'Zomato Delivery', flat: 'B-305', inTime: '12:05 PM', outTime: '12:15 PM', status: 'Completed', guard: 'Ramesh Singh' },
        { id: '2', name: 'Plumber', flat: 'A-102', inTime: '11:30 AM', outTime: '12:30 PM', status: 'Completed', guard: 'Ramesh Singh' },
        { id: '3', name: 'Amazon Package', flat: 'C-501', inTime: '10:00 AM', outTime: '10:05 AM', status: 'Completed', guard: 'Vijay Patel' },
        { id: '4', name: 'Swiggy Delivery', flat: 'A-201', inTime: '10:05 AM', outTime: '--:--', status: 'Inside', guard: 'Ramesh Singh' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Shift Logs</Text>
                <Text style={styles.subtitle}>All recorded gate activities</Text>
            </View>

            <View style={styles.content}>
                <FlatList
                    data={logs}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.logCard}>
                            <View style={styles.logHeader}>
                                <Text style={styles.logName}>{item.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? theme.colors.success + '20' : theme.colors.warning + '20' }]}>
                                    <Text style={[styles.statusText, { color: item.status === 'Completed' ? theme.colors.success : theme.colors.warning }]}>{item.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.logDetail}>Destination: Flat {item.flat}</Text>
                            <View style={styles.timeRow}>
                                <Text style={styles.timeText}>In: {item.inTime}</Text>
                                <Text style={styles.timeText}>Out: {item.outTime}</Text>
                            </View>
                            <Text style={styles.guardText}>Logged by {item.guard}</Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderColor: theme.colors.border },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    subtitle: { fontSize: 13, color: theme.colors.text.secondary },
    content: { flex: 1, padding: theme.spacing.lg },

    logCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    logName: { fontSize: 16, fontWeight: 'bold' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    logDetail: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: 8 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.colors.background },
    timeText: { fontSize: 13, fontWeight: '500' },
    guardText: { fontSize: 11, color: theme.colors.text.disabled, textAlign: 'right', fontStyle: 'italic' }
});
