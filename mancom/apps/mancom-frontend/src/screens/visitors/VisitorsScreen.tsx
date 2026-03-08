import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity,
    Modal, TextInput, RefreshControl, ActivityIndicator, Alert, Share, Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { theme } from '../../config/theme';
import { apiClient } from '../../core/api/client';
import QRCode from 'react-native-qrcode-svg';

interface VisitorPass {
    id: string;
    visitorName: string;
    visitorPhone?: string;
    purpose?: string;
    expectedAt?: string;
    token: string;
    status: 'pending' | 'arrived' | 'expired' | 'cancelled';
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
    pending: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB', emoji: '⏳' },
    arrived: { label: 'Arrived', color: '#10B981', bg: '#ECFDF5', emoji: '✅' },
    expired: { label: 'Expired', color: '#94A3B8', bg: '#F8FAFC', emoji: '⌛' },
    cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FFF1F2', emoji: '❌' },
};

export function VisitorsScreen() {
    const [tab, setTab] = useState<'passes' | 'history'>('passes');
    const [passes, setPasses] = useState<VisitorPass[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPassModal, setShowPassModal] = useState(false);
    const [selectedPass, setSelectedPass] = useState<VisitorPass | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        visitorName: '',
        visitorPhone: '',
        purpose: '',
        expectedAt: '',
    });

    const fetchPasses = useCallback(async () => {
        try {
            const res = await apiClient.get('/visitors/passes');
            const data = res.data?.data || res.data || [];
            setPasses(Array.isArray(data) ? data : []);
        } catch {
            // silent
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchPasses(); }, [fetchPasses]);
    const onRefresh = () => { setRefreshing(true); fetchPasses(); };

    const handleCreatePass = async () => {
        if (!form.visitorName.trim()) return Alert.alert('Error', 'Visitor name is required');
        setSubmitting(true);
        try {
            const res = await apiClient.post('/visitors/passes', form);
            const passData = res.data?.data || res.data;
            setPasses(prev => [passData, ...prev]);
            setSelectedPass(passData);
            setShowAddModal(false);
            setShowPassModal(true);
            setForm({ visitorName: '', visitorPhone: '', purpose: '', expectedAt: '' });
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to create pass');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelPass = async (pass: VisitorPass) => {
        Alert.alert('Cancel Pass', `Cancel pass for ${pass.visitorName}?`, [
            { text: 'Keep', style: 'cancel' },
            {
                text: 'Cancel Pass', style: 'destructive',
                onPress: async () => {
                    try {
                        await apiClient.patch(`/visitors/passes/cancel/${pass.token}`);
                        fetchPasses();
                    } catch {
                        Alert.alert('Error', 'Failed to cancel pass');
                    }
                },
            },
        ]);
    };

    const handleSharePass = async (pass: VisitorPass) => {
        const message = [
            'You have been invited to visit!',
            '',
            `Visitor: ${pass.visitorName}`,
            pass.expectedAt ? `Expected: ${new Date(pass.expectedAt).toLocaleString()}` : '',
            '',
            'Show this code to the security guard at the gate:',
            `CODE: ${pass.token.substring(0, 8).toUpperCase()}`,
            '',
            'This pass is valid for 24 hours.',
        ].filter(Boolean).join('\n');

        try {
            await Share.share({ message, title: 'Visitor Gate Pass' });
        } catch { }
    };

    const activePasses = passes.filter(p => p.status === 'pending' || p.status === 'arrived');
    const historyPasses = passes.filter(p => p.status === 'expired' || p.status === 'cancelled');

    const displayList = tab === 'passes' ? activePasses : historyPasses;

    const renderPass = ({ item }: { item: VisitorPass }) => {
        const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        return (
            <TouchableOpacity
                style={styles.passCard}
                onPress={() => { setSelectedPass(item); setShowPassModal(true); }}
                activeOpacity={0.8}
            >
                <View style={styles.passLeft}>
                    <View style={[styles.passAvatar, { backgroundColor: st.bg }]}>
                        <Text style={styles.passAvatarText}>{item.visitorName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.passInfo}>
                        <Text style={styles.passName}>{item.visitorName}</Text>
                        {item.purpose ? <Text style={styles.passPurpose}>{item.purpose}</Text> : null}
                        {item.expectedAt ? (
                            <Text style={styles.passTime}>
                                Expected: {new Date(item.expectedAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        ) : (
                            <Text style={styles.passTime}>Created: {new Date(item.createdAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.passRight}>
                    <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                        <Text style={[styles.statusText, { color: st.color }]}>{st.emoji} {st.label}</Text>
                    </View>
                    {item.status === 'pending' && (
                        <TouchableOpacity style={styles.shareBtn} onPress={() => handleSharePass(item)}>
                            <Text style={styles.shareBtnText}>Share</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Visitor Management</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <Text style={styles.addBtnText}>+ Invite</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {(['passes', 'history'] as const).map(t => (
                    <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                            {t === 'passes' ? `Active Passes (${activePasses.length})` : `History (${historyPasses.length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={displayList}
                    keyExtractor={i => i.id}
                    renderItem={renderPass}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyEmoji}>{tab === 'passes' ? '👋' : '⏳'}</Text>
                            <Text style={styles.emptyTitle}>{tab === 'passes' ? 'No active passes' : 'No history yet'}</Text>
                            <Text style={styles.emptySub}>
                                {tab === 'passes'
                                    ? 'Tap "+ Invite" to pre-approve a guest and generate a gate pass'
                                    : 'Expired and cancelled passes will appear here'}
                            </Text>
                            {tab === 'passes' && (
                                <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddModal(true)}>
                                    <Text style={styles.emptyBtnText}>Generate Gate Pass</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}

            {/* ─── Create Pass Modal ─── */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        <Text style={styles.sheetTitle}>Generate Gate Pass</Text>
                        <Text style={styles.sheetSub}>Pre-approve your visitor for frictionless gate entry</Text>

                        <Text style={styles.fieldLabel}>Visitor Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Full name"
                            placeholderTextColor="#AAA"
                            value={form.visitorName}
                            onChangeText={v => setForm(f => ({ ...f, visitorName: v }))}
                        />

                        <Text style={styles.fieldLabel}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="10-digit mobile"
                            placeholderTextColor="#AAA"
                            value={form.visitorPhone}
                            onChangeText={v => setForm(f => ({ ...f, visitorPhone: v }))}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.fieldLabel}>Purpose of Visit</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Delivery, Friend, Relative"
                            placeholderTextColor="#AAA"
                            value={form.purpose}
                            onChangeText={v => setForm(f => ({ ...f, purpose: v }))}
                        />

                        <Text style={styles.fieldLabel}>Expected Date & Time</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 2026-03-05 15:00"
                            placeholderTextColor="#AAA"
                            value={form.expectedAt}
                            onChangeText={v => setForm(f => ({ ...f, expectedAt: v }))}
                        />

                        <View style={styles.sheetActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                onPress={handleCreatePass}
                                disabled={submitting}
                            >
                                {submitting
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.submitBtnText}>Generate Pass</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ─── Pass Detail Modal ─── */}
            <Modal visible={showPassModal} animationType="fade" transparent>
                <View style={styles.overlay}>
                    {selectedPass && (() => {
                        const st = STATUS_CONFIG[selectedPass.status] || STATUS_CONFIG.pending;
                        return (
                            <View style={styles.passDetailCard}>
                                <Text style={styles.passDetailTitle}>Gate Pass</Text>
                                <View style={[styles.passDetailStatus, { backgroundColor: st.bg }]}>
                                    <Text style={[styles.passDetailStatusText, { color: st.color }]}>{st.emoji} {st.label}</Text>
                                </View>

                                {/* Real QR Code using the token */}
                                <View style={styles.qrBox}>
                                    <QRCode
                                        value={selectedPass.token}
                                        size={140}
                                        color={theme.colors.text.primary}
                                        backgroundColor="transparent"
                                    />
                                    <Text style={styles.qrCodeText}>{selectedPass.token.substring(0, 8).toUpperCase()}</Text>
                                    <Text style={styles.qrHint}>Security scans this code at the gate</Text>
                                </View>

                                <View style={styles.passDetailRow}>
                                    <Text style={styles.passDetailKey}>Visitor</Text>
                                    <Text style={styles.passDetailVal}>{selectedPass.visitorName}</Text>
                                </View>
                                {selectedPass.visitorPhone ? (
                                    <View style={styles.passDetailRow}>
                                        <Text style={styles.passDetailKey}>Phone</Text>
                                        <Text style={styles.passDetailVal}>{selectedPass.visitorPhone}</Text>
                                    </View>
                                ) : null}
                                {selectedPass.purpose ? (
                                    <View style={styles.passDetailRow}>
                                        <Text style={styles.passDetailKey}>Purpose</Text>
                                        <Text style={styles.passDetailVal}>{selectedPass.purpose}</Text>
                                    </View>
                                ) : null}
                                <View style={styles.passDetailRow}>
                                    <Text style={styles.passDetailKey}>Valid Until</Text>
                                    <Text style={styles.passDetailVal}>24 hours from creation</Text>
                                </View>

                                <View style={styles.passDetailActions}>
                                    {selectedPass.status === 'pending' && (
                                        <TouchableOpacity
                                            style={styles.shareFullBtn}
                                            onPress={() => handleSharePass(selectedPass)}
                                        >
                                            <Text style={styles.shareFullBtnText}>📤 Share Pass</Text>
                                        </TouchableOpacity>
                                    )}
                                    {selectedPass.status === 'pending' && (
                                        <TouchableOpacity
                                            style={styles.cancelPassBtn}
                                            onPress={() => { setShowPassModal(false); handleCancelPass(selectedPass); }}
                                        >
                                            <Text style={styles.cancelPassBtnText}>Cancel Pass</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPassModal(false)}>
                                        <Text style={styles.closeBtnText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })()}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
    },
    title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
    addBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
    tab: { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: theme.colors.primary },
    tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
    tabTextActive: { color: theme.colors.primary },

    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, paddingBottom: 80 },

    passCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 14,
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 10, shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
    },
    passLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    passAvatar: {
        width: 46, height: 46, borderRadius: 23,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    passAvatarText: { fontSize: 20, fontWeight: '800', color: theme.colors.primary },
    passInfo: { flex: 1 },
    passName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
    passPurpose: { fontSize: 13, color: '#666', marginBottom: 2 },
    passTime: { fontSize: 12, color: '#AAA' },
    passRight: { alignItems: 'flex-end', gap: 6 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },
    shareBtn: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    shareBtnText: { fontSize: 11, fontWeight: '700', color: theme.colors.primary },

    empty: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    emptyBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, paddingBottom: 40,
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
    sheetSub: { fontSize: 13, color: '#888', marginBottom: 20 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 8 },
    input: {
        backgroundColor: '#F5F6FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
        fontSize: 15, color: '#1A1A2E', borderWidth: 1, borderColor: '#EBEBEB',
    },
    sheetActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, padding: 15, borderRadius: 14, backgroundColor: '#F5F6FA', alignItems: 'center' },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#666' },
    submitBtn: { flex: 2, padding: 15, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center' },
    submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    // Pass detail modal
    passDetailCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24, margin: 20,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    },
    passDetailTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 10 },
    passDetailStatus: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 20 },
    passDetailStatusText: { fontSize: 14, fontWeight: '700' },
    qrBox: {
        width: 180, height: 180, borderRadius: 16, backgroundColor: '#F7F8FA',
        borderWidth: 2, borderStyle: 'dashed', borderColor: '#DDD',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    qrEmoji: { fontSize: 64, marginBottom: 4 },
    qrCodeText: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', letterSpacing: 3, marginTop: 10 },
    qrHint: { fontSize: 11, color: '#AAA', marginTop: 4, textAlign: 'center' },
    passDetailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    passDetailKey: { fontSize: 13, color: '#888', fontWeight: '600' },
    passDetailVal: { fontSize: 13, color: '#1A1A2E', fontWeight: '600' },
    passDetailActions: { width: '100%', marginTop: 20, gap: 10 },
    shareFullBtn: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 14, alignItems: 'center' },
    shareFullBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    cancelPassBtn: { backgroundColor: '#FFF1F2', padding: 14, borderRadius: 14, alignItems: 'center' },
    cancelPassBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
    closeBtn: { padding: 14, borderRadius: 14, alignItems: 'center' },
    closeBtnText: { color: '#888', fontWeight: '600', fontSize: 15 },
});

export default VisitorsScreen;
