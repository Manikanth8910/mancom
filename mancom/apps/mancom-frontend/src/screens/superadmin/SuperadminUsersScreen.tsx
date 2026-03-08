import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal, ActivityIndicator } from 'react-native';
import { theme } from '../../config/theme';
import apiClient from '../../core/api/client';
import { useToast } from '../../components/ui/Toast';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';

export function SuperadminUsersScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'USER', societyId: '' });
    const { showToast } = useToast();

    useEffect(() => {
        // Fetch global users (mostly society admins)
        const fetchUsers = async () => {
            try {
                const res = await apiClient.get('/users');
                if (res.data) {
                    setUsers(res.data);
                } else {
                    setUsers([]);
                }
            } catch {
                showToast('Failed to load global users.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [showToast]);

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.role) {
            showToast('Email and Role are required!', 'error');
            return;
        }
        setIsCreating(true);
        try {
            const res = await apiClient.post('/users', newUser);
            setUsers((prev: any[]) => [res.data, ...prev]);
            showToast('User created successfully!', 'success');
            setModalVisible(false);
            setNewUser({ name: '', email: '', phone: '', role: 'USER', societyId: '' });
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Failed to create user', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Global Users</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addBtnText}>+ Create User</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by Name, Email or Society"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
                        <SkeletonLoader height={120} borderRadius={12} />
                        <SkeletonLoader height={120} borderRadius={12} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredUsers}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="👥"
                                title="No Users Found"
                                description="Could not find any global users matching this criteria."
                            />
                        }
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{item.name || 'Unnamed'}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                                        <Text style={[styles.statusText, { color: theme.colors.success }]}>Active</Text>
                                    </View>
                                </View>
                                <Text style={styles.emailText}>✉️ {item.email}</Text>
                                <View style={styles.metricsRow}>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Role</Text>
                                        <Text style={styles.metricValue}>{item.role}</Text>
                                    </View>
                                    {item.society && (
                                        <View style={styles.metricItem}>
                                            <Text style={styles.metricLabel}>Society</Text>
                                            <Text style={[styles.metricValue, { color: theme.colors.primary }]}>{item.society.name}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>

            {/* Create User Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New User</Text>

                        <TextInput style={styles.input} placeholder="Name" value={newUser.name} onChangeText={(t) => setNewUser({ ...newUser, name: t })} />
                        <TextInput style={styles.input} placeholder="Email" value={newUser.email} onChangeText={(t) => setNewUser({ ...newUser, email: t })} keyboardType="email-address" />
                        <TextInput style={styles.input} placeholder="Phone" value={newUser.phone} onChangeText={(t) => setNewUser({ ...newUser, phone: t })} keyboardType="phone-pad" />

                        <Text style={{ marginTop: 10, marginBottom: 5, color: theme.colors.text.secondary }}>Role</Text>
                        <View style={styles.roleTabs}>
                            {['USER', 'ADMIN', 'SECURITY', 'SUPERADMIN'].map(r => (
                                <TouchableOpacity key={r} style={[styles.roleTab, newUser.role === r && styles.roleTabActive]} onPress={() => setNewUser({ ...newUser, role: r })}>
                                    <Text style={[styles.roleTabText, newUser.role === r && styles.roleTabTextActive]}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateUser} disabled={isCreating}>
                                {isCreating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create User</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    emailText: { fontSize: 13, color: theme.colors.text.secondary, marginBottom: theme.spacing.lg, marginTop: 4 },

    metricsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md },
    metricItem: { flex: 1 },
    metricLabel: { fontSize: 11, color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: 4 },
    metricValue: { fontSize: 14, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl },
    modalTitle: { fontSize: 20, fontWeight: theme.fontWeight.bold, marginBottom: theme.spacing.lg, color: theme.colors.text.primary },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, fontSize: 15 },
    roleTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.xl },
    roleTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
    roleTabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    roleTabText: { color: theme.colors.text.secondary, fontSize: 12, fontWeight: 'bold' },
    roleTabTextActive: { color: '#fff' },
    modalActions: { flexDirection: 'row', gap: theme.spacing.md },
    cancelBtn: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.border, alignItems: 'center' },
    cancelBtnText: { fontWeight: 'bold', color: theme.colors.text.primary },
    submitBtn: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.primary, alignItems: 'center' },
    submitBtnText: { fontWeight: 'bold', color: '#fff' }
});

export default SuperadminUsersScreen;
