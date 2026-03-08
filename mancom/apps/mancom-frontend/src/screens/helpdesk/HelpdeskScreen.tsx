import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Modal, ScrollView, TextInput as RNTextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadTickets, selectTickets } from '../../store/slices/helpdeskSlice';
import { theme } from '../../config/theme';

export function HelpdeskScreen() {
    const dispatch = useAppDispatch();
    const tickets = useAppSelector(selectTickets);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(loadTickets());
    }, [dispatch]);

    const getSeverityColor = (severity: string) => {
        if (severity === 'high') return theme.colors.error;
        if (severity === 'medium') return theme.colors.warning;
        return theme.colors.primary;
    };

    const StatusPill = ({ status }: { status: string }) => {
        let bg = '#E5E7EB';
        let color: string = theme.colors.text.secondary;
        let text = status.toUpperCase();

        if (status === 'resolved') {
            bg = '#E6F9F4';
            color = theme.colors.success;
        } else if (status === 'in-progress' || status === 'pending') {
            bg = '#FFF7E6';
            color = theme.colors.warning;
            text = 'PENDING';
        } else {
            bg = '#FFEDED';
            color = theme.colors.error;
            text = 'OPEN';
        }

        return (
            <View style={[styles.statusPill, { backgroundColor: bg }]}>
                <Text style={[styles.statusText, { color }]}>{text}</Text>
            </View>
        );
    };

    const filteredTickets = tickets.filter(t => {
        if (filter === 'pending' && t.status === 'resolved') return false;
        if (filter === 'resolved' && t.status !== 'resolved') return false;
        if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Helpdesk</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <RNTextInput
                        style={styles.searchInput}
                        placeholder="Search tickets..."
                        placeholderTextColor={theme.colors.text.disabled}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.chipsContainer}>
                    <TouchableOpacity
                        style={[styles.chip, filter === 'all' && styles.chipActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, filter === 'pending' && styles.chipActive]}
                        onPress={() => setFilter('pending')}
                    >
                        <Text style={[styles.chipText, filter === 'pending' && styles.chipTextActive]}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, filter === 'resolved' && styles.chipActive]}
                        onPress={() => setFilter('resolved')}
                    >
                        <Text style={[styles.chipText, filter === 'resolved' && styles.chipTextActive]}>Resolved</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <FlatList
                    data={filteredTickets}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const isHigh = item.id.includes('1') || item.title.toLowerCase().includes('leak');
                        const severityColor = getSeverityColor(isHigh ? 'high' : 'medium');
                        return (
                            <View style={styles.card}>
                                <View style={[styles.cardBorder, { backgroundColor: severityColor }]} />
                                <View style={styles.cardContent}>
                                    <View style={styles.aiBadge}>
                                        <Text style={styles.aiBadgeIcon}>✨</Text>
                                        <Text style={styles.aiBadgeText}>AI Assigned to: Plumbing</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.desc}>{item.title}</Text>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <Text style={styles.date}>Raised: {item.date}</Text>
                                        <StatusPill status={item.status} />
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🛠️</Text>
                            <Text style={styles.emptyText}>No tickets found.</Text>
                        </View>
                    }
                />

                <TouchableOpacity style={styles.fab} onPress={() => setIsCreateModalOpen(true)}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Create Ticket Modal */}
            <Modal visible={isCreateModalOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.dragHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Raise a Ticket</Text>
                            <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <RNTextInput
                                style={styles.input}
                                placeholder="Issue Title (e.g., Leaking Pipe)"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={title}
                                onChangeText={setTitle}
                            />
                            <RNTextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe the issue in detail"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={desc}
                                onChangeText={setDesc}
                                multiline
                                textAlignVertical="top"
                            />

                            <Text style={styles.attachmentLabel}>Attachments (Photos/Videos)</Text>
                            <TouchableOpacity style={styles.uploadArea}>
                                <Text style={styles.uploadIcon}>📷</Text>
                                <Text style={styles.uploadText}>Tap to add photos of the issue</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={() => {
                                    setIsCreateModalOpen(false);
                                    setTitle('');
                                    setDesc('');
                                }}
                            >
                                <Text style={styles.submitBtnText}>Submit Ticket</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    searchContainer: { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.md, height: 48, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
    searchIcon: { fontSize: 18, marginRight: theme.spacing.sm },
    searchInput: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text.primary },

    chipsContainer: { flexDirection: 'row', gap: theme.spacing.sm },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 13, fontWeight: theme.fontWeight.medium, color: theme.colors.text.secondary },
    chipTextActive: { color: theme.colors.surface, fontWeight: theme.fontWeight.bold },

    content: { flex: 1, paddingHorizontal: theme.spacing.lg },

    card: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
    cardBorder: { width: 6, height: '100%' },
    cardContent: { flex: 1, padding: theme.spacing.lg },

    aiBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: theme.spacing.sm },
    aiBadgeIcon: { fontSize: 12, marginRight: 4 },
    aiBadgeText: { fontSize: 10, fontWeight: theme.fontWeight.bold, color: '#2563EB' },

    row: { marginBottom: theme.spacing.md },
    desc: { fontSize: 16, fontWeight: theme.fontWeight.semibold, color: theme.colors.text.primary, lineHeight: 22 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: 13, color: theme.colors.text.secondary },

    statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: theme.fontWeight.bold },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 40, marginBottom: theme.spacing.md },
    emptyText: { textAlign: 'center', color: theme.colors.text.secondary, fontSize: theme.fontSize.md },

    fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    fabText: { fontSize: 32, color: theme.colors.surface, fontWeight: '300', marginBottom: 2 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.4)', justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, height: '80%' },
    dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: theme.spacing.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
    modalTitle: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    cancelText: { color: theme.colors.text.secondary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium },

    modalContent: { padding: theme.spacing.lg },
    input: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.md, paddingVertical: 14, marginBottom: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text.primary, borderWidth: 1, borderColor: theme.colors.border },
    textArea: { height: 120, paddingTop: 14 },

    attachmentLabel: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium, color: theme.colors.text.primary, marginBottom: theme.spacing.sm, marginTop: theme.spacing.sm },
    uploadArea: { borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, alignItems: 'center', backgroundColor: '#F9FAFB', marginBottom: theme.spacing.xxl },
    uploadIcon: { fontSize: 32, marginBottom: theme.spacing.xs },
    uploadText: { color: theme.colors.text.secondary, fontSize: theme.fontSize.sm },

    submitBtn: { width: '100%', height: 56, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    submitBtnText: { color: theme.colors.surface, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold },
});

export default HelpdeskScreen;
