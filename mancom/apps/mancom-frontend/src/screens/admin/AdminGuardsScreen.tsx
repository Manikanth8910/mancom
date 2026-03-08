import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

export function AdminGuardsScreen() {
    const navigation = useNavigation();

    const guards = [
        { id: '1', name: 'Ramesh Singh', status: 'On Duty', gate: 'Main Gate' },
        { id: '2', name: 'Sunil Kumar', status: 'Off Duty', gate: 'Gate 2' },
        { id: '3', name: 'Vijay Patel', status: 'On Leave', gate: 'Back Gate' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Security Guards</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={styles.content}>
                <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Coming Soon', 'Register new guard flow.')}>
                    <Text style={styles.addBtnText}>+ Register Guard</Text>
                </TouchableOpacity>

                <FlatList
                    data={guards}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>🛡️</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.nameText}>{item.name}</Text>
                                <Text style={styles.gateText}>Assigned: {item.gate}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: item.status === 'On Duty' ? theme.colors.success + '20' : theme.colors.border }]}>
                                <Text style={[styles.statusText, { color: item.status === 'On Duty' ? theme.colors.success : theme.colors.text.secondary }]}>{item.status}</Text>
                            </View>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg, borderBottomWidth: 1, borderColor: theme.colors.border },
    backButton: { width: 60 },
    backBtnText: { color: theme.colors.primary, fontSize: 16 },
    title: { fontSize: 18, fontWeight: theme.fontWeight.bold },
    content: { padding: theme.spacing.lg, flex: 1 },
    addBtn: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', marginBottom: theme.spacing.xl },
    addBtnText: { color: theme.colors.primary, fontWeight: theme.fontWeight.bold, fontSize: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    avatarText: { fontSize: 20 },
    cardContent: { flex: 1 },
    nameText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    gateText: { fontSize: 12, color: theme.colors.text.secondary },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: theme.fontWeight.bold }
});
