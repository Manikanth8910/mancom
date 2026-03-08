import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { theme } from '../../config/theme';
import apiClient from '../../core/api/client';
import { useToast } from '../../components/ui/Toast';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';

export function SuperadminSocietiesScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchSocieties = async () => {
            try {
                const res = await apiClient.get('/societies');
                setAccounts(res.data);
            } catch {
                showToast('Failed to fetch societies.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSocieties();
    }, [showToast]);

    const filteredAccounts = accounts.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Societies</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => showToast('Onboarding Wizard Started', 'success')}>
                    <Text style={styles.addBtnText}>+ Onboard Client</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by Society Name or City"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
                        <SkeletonLoader height={140} borderRadius={12} />
                        <SkeletonLoader height={140} borderRadius={12} />
                        <SkeletonLoader height={140} borderRadius={12} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredAccounts}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="🏢"
                                title="No Societies Found"
                                description="Adjust your search or onboard a new client to see them here."
                            />
                        }
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? theme.colors.success + '20' : theme.colors.warning + '20' }]}>
                                        <Text style={[styles.statusText, { color: item.status === 'Active' ? theme.colors.success : theme.colors.warning }]}>{item.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.cityText}>📍 {item.city}</Text>
                                <View style={styles.metricsRow}>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Total Units</Text>
                                        <Text style={styles.metricValue}>{item.units}</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>MTD Collection</Text>
                                        <Text style={[styles.metricValue, { color: theme.colors.primary }]}>{item.collected}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    addBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.borderRadius.md },
    addBtnText: { color: theme.colors.surface, fontWeight: theme.fontWeight.bold, fontSize: 13 },

    searchContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderColor: theme.colors.border },
    searchInput: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: 15 },

    content: { flex: 1, padding: theme.spacing.lg },

    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    cardTitle: { fontSize: 16, fontWeight: theme.fontWeight.bold, flex: 1, marginRight: theme.spacing.sm },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    cityText: { fontSize: 13, color: theme.colors.text.secondary, marginBottom: theme.spacing.lg, marginTop: 4 },

    metricsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md },
    metricItem: { flex: 1 },
    metricLabel: { fontSize: 11, color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: 4 },
    metricValue: { fontSize: 15, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary }
});
