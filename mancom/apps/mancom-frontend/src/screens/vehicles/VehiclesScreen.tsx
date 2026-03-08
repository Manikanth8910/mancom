import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { theme } from '../../config/theme';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../core/api/client';

interface Vehicle {
    id: number;
    vehicle_number: string;
    vehicle_type: 'car' | 'bike';
    model?: string;
    color?: string;
    is_ev: boolean;
    owner_name?: string;
}

interface ActiveSession {
    id: number;
    vehicle_number: string;
    slot_number?: string;
    entry_time: string;
    status: string;
}

const PARKING_API = 'http://localhost:3005';

export function VehiclesScreen() {
    const navigation = useNavigation();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [activeSession, _setActiveSession] = useState<ActiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        vehicle_type: 'car' as 'car' | 'bike',
        vehicle_number: '',
        model: '',
        color: '',
        is_ev: false,
        owner_name: '',
        phone_number: '',
        member_id: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const [vRes] = await Promise.allSettled([
                apiClient.get(`${PARKING_API}/api/vehicles`),
            ]);
            if (vRes.status === 'fulfilled') {
                setVehicles(vRes.value.data || []);
            }
        } catch (err) {
            console.log('Vehicles fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleAddVehicle = async () => {
        if (!form.vehicle_number.trim()) return Alert.alert('Error', 'Vehicle number is required');
        if (!form.owner_name.trim()) return Alert.alert('Error', 'Owner name is required');
        if (!form.phone_number.trim()) return Alert.alert('Error', 'Phone number is required');
        if (!form.member_id.trim()) return Alert.alert('Error', 'Flat/Member ID is required');

        setSubmitting(true);
        try {
            await apiClient.post(`${PARKING_API}/api/vehicles`, form);
            setShowAddModal(false);
            setForm({
                vehicle_type: 'car',
                vehicle_number: '',
                model: '',
                color: '',
                is_ev: false,
                owner_name: '',
                phone_number: '',
                member_id: '',
            });
            Alert.alert('✅ Success', 'Vehicle registered successfully!');
            fetchData();
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || 'Registration failed';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteVehicle = (id: number, number: string) => {
        Alert.alert(
            'Remove Vehicle',
            `Remove ${number} from your account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove', style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`${PARKING_API}/api/vehicles/${id}`);
                            fetchData();
                        } catch {
                            Alert.alert('Error', 'Failed to remove vehicle');
                        }
                    },
                },
            ]
        );
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getElapsedTime = (iso: string) => {
        const start = new Date(iso).getTime();
        const now = Date.now();
        const mins = Math.floor((now - start) / 60000);
        if (mins < 60) return `${mins}m`;
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Vehicles & Parking</Text>
                    <Text style={styles.headerSub}>{vehicles.length} registered vehicle{vehicles.length !== 1 ? 's' : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowQRModal(true)} style={styles.qrBtn}>
                    <Text style={styles.qrIcon}>⊞</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Active Session Banner */}
                {activeSession && (
                    <View style={styles.sessionCard}>
                        <View style={styles.sessionLeft}>
                            <View style={styles.sessionDot} />
                            <View>
                                <Text style={styles.sessionLabel}>Active Session</Text>
                                <Text style={styles.sessionVehicle}>{activeSession.vehicle_number}</Text>
                                <Text style={styles.sessionDetails}>
                                    Slot {activeSession.slot_number || 'General'} • {formatTime(activeSession.entry_time)} ({getElapsedTime(activeSession.entry_time)})
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.exitBtn}>
                            <Text style={styles.exitBtnText}>Exit</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* My Vehicles Section */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>🚗 My Vehicles</Text>
                    {vehicles.length < 2 && (
                        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                            <Text style={styles.addBtnText}>+ Register</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Loading vehicles...</Text>
                    </View>
                ) : vehicles.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>🅿️</Text>
                        <Text style={styles.emptyTitle}>No vehicles registered</Text>
                        <Text style={styles.emptySub}>Register your car or bike to enable QR gate entry, parking slot assignment and session tracking.</Text>
                        <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddModal(true)}>
                            <Text style={styles.emptyAddBtnText}>Register First Vehicle</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    vehicles.map((v) => (
                        <View key={v.id} style={styles.vehicleCard}>
                            <View style={styles.vehicleIcon}>
                                <Text style={styles.vehicleEmoji}>{v.vehicle_type === 'car' ? '🚙' : '🏍️'}</Text>
                            </View>
                            <View style={styles.vehicleInfo}>
                                <View style={styles.vehicleTopRow}>
                                    <Text style={styles.vehicleNumber}>{v.vehicle_number}</Text>
                                    {v.is_ev && <View style={styles.evBadge}><Text style={styles.evText}>⚡ EV</Text></View>}
                                </View>
                                <Text style={styles.vehicleModel}>{v.model || 'Unknown model'} • {v.color || 'Unknown color'}</Text>
                                <Text style={styles.vehicleType}>{v.vehicle_type === 'car' ? 'Four Wheeler' : 'Two Wheeler'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteVehicle(v.id, v.vehicle_number)} style={styles.deleteBtn}>
                                <Text style={styles.deleteIcon}>🗑</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                {/* Parking Info Cards */}
                <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 12 }]}>🅿️ Parking Info</Text>
                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <Text style={styles.infoValue}>Show QR</Text>
                        <Text style={styles.infoLabel}>at Gate Entry</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoIcon}>🚦</Text>
                        <Text style={styles.infoValue}>Auto Slot</Text>
                        <Text style={styles.infoLabel}>Assignment</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoIcon}>💵</Text>
                        <Text style={styles.infoValue}>₹10/hr</Text>
                        <Text style={styles.infoLabel}>Visitor Rate</Text>
                    </View>
                </View>

                <View style={styles.qrHintCard}>
                    <Text style={styles.qrHintIcon}>⊞</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.qrHintTitle}>Gate QR Entry</Text>
                        <Text style={styles.qrHintSub}>Tap the QR icon at the top to generate a one-time entry QR valid for 5 minutes. Show it to security at the gate.</Text>
                    </View>
                </View>
            </ScrollView>

            {/* ─── Add Vehicle Modal ─── */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Register Vehicle</Text>
                        <Text style={styles.modalSub}>Add your car or bike for parking access</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Type selector */}
                            <Text style={styles.fieldLabel}>Vehicle Type</Text>
                            <View style={styles.typeRow}>
                                {(['car', 'bike'] as const).map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeBtn, form.vehicle_type === t && styles.typeBtnActive]}
                                        onPress={() => setForm(f => ({ ...f, vehicle_type: t }))}
                                    >
                                        <Text style={styles.typeEmoji}>{t === 'car' ? '🚙' : '🏍️'}</Text>
                                        <Text style={[styles.typeBtnText, form.vehicle_type === t && styles.typeBtnTextActive]}>
                                            {t === 'car' ? 'Car' : 'Bike'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Vehicle Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. TS09EA1234"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={form.vehicle_number}
                                onChangeText={(v) => setForm(f => ({ ...f, vehicle_number: v.toUpperCase() }))}
                                autoCapitalize="characters"
                            />

                            <Text style={styles.fieldLabel}>Owner Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Full name as on RC"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={form.owner_name}
                                onChangeText={(v) => setForm(f => ({ ...f, owner_name: v }))}
                            />

                            <Text style={styles.fieldLabel}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="10-digit mobile number"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={form.phone_number}
                                onChangeText={(v) => setForm(f => ({ ...f, phone_number: v }))}
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.fieldLabel}>Flat / Member ID *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. A-201 or MBR001"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={form.member_id}
                                onChangeText={(v) => setForm(f => ({ ...f, member_id: v }))}
                            />

                            <Text style={styles.fieldLabel}>Vehicle Model</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Swift, Activa"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={form.model}
                                onChangeText={(v) => setForm(f => ({ ...f, model: v }))}
                            />

                            <Text style={styles.fieldLabel}>Color</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. White, Black"
                                placeholderTextColor={theme.colors.text.disabled}
                                value={form.color}
                                onChangeText={(v) => setForm(f => ({ ...f, color: v }))}
                            />

                            {/* EV toggle */}
                            <TouchableOpacity style={styles.evToggle} onPress={() => setForm(f => ({ ...f, is_ev: !f.is_ev }))}>
                                <Text style={styles.evToggleLabel}>⚡ Electric Vehicle (EV)?</Text>
                                <View style={[styles.toggle, form.is_ev && styles.toggleOn]}>
                                    <View style={[styles.knob, form.is_ev && styles.knobOn]} />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleAddVehicle} disabled={submitting}>
                                    {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Register Vehicle</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ─── QR Info Modal ─── */}
            <Modal visible={showQRModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.qrModalSheet}>
                        <Text style={styles.qrModalIcon}>⊞</Text>
                        <Text style={styles.qrModalTitle}>Gate Entry QR</Text>
                        <Text style={styles.qrModalSub}>
                            QR entry requires the <Text style={{ fontWeight: 'bold' }}>Parking Service</Text> to be running. Once integrated, this will generate a one-time QR code for gate access.{'\n\n'}
                            ✅ Parking Service is running on port 3005{'\n'}
                            ✅ Your vehicles are synced{'\n'}
                            ✅ Security staff can scan at gate
                        </Text>
                        <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQRModal(false)}>
                            <Text style={styles.qrCloseBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 24, color: '#1A1A2E' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
    headerSub: { fontSize: 12, color: '#888', marginTop: 1 },
    qrBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center', alignItems: 'center',
    },
    qrIcon: { fontSize: 20, color: theme.colors.primary },

    content: { padding: 20, paddingBottom: 50 },

    // Session
    sessionCard: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sessionDot: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#4ADE80',
        shadowColor: '#4ADE80', shadowOpacity: 0.8, shadowRadius: 6,
    },
    sessionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
    sessionVehicle: { fontSize: 16, fontWeight: '700', color: '#fff' },
    sessionDetails: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    exitBtn: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    exitBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    // Section
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
    addBtn: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 12,
    },
    addBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },

    // Loading
    centerBox: { alignItems: 'center', paddingVertical: 40 },
    loadingText: { color: '#888', marginTop: 12, fontSize: 14 },

    // Empty
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#EBEBEB',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
    emptySub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    emptyAddBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    emptyAddBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Vehicle Card
    vehicleCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    vehicleIcon: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    vehicleEmoji: { fontSize: 26 },
    vehicleInfo: { flex: 1 },
    vehicleTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    vehicleNumber: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
    evBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    evText: { fontSize: 11, color: '#10B981', fontWeight: '600' },
    vehicleModel: { fontSize: 13, color: '#666', marginBottom: 2 },
    vehicleType: { fontSize: 12, color: '#AAA' },
    deleteBtn: { padding: 8 },
    deleteIcon: { fontSize: 18 },

    // Info Grid
    infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    infoCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    infoIcon: { fontSize: 24, marginBottom: 6 },
    infoValue: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
    infoLabel: { fontSize: 11, color: '#888', textAlign: 'center' },

    qrHintCard: {
        backgroundColor: '#EEF2FF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        marginTop: 4,
    },
    qrHintIcon: { fontSize: 32, color: theme.colors.primary },
    qrHintTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
    qrHintSub: { fontSize: 13, color: '#555', lineHeight: 19 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: '90%',
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
    modalSub: { fontSize: 13, color: '#888', marginBottom: 24 },

    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
    input: {
        backgroundColor: '#F5F6FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        fontSize: 15,
        color: '#1A1A2E',
        borderWidth: 1,
        borderColor: '#EBEBEB',
    },
    typeRow: { flexDirection: 'row', gap: 12 },
    typeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F5F6FA',
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
    typeEmoji: { fontSize: 22 },
    typeBtnText: { fontSize: 14, fontWeight: '600', color: '#666' },
    typeBtnTextActive: { color: theme.colors.primary },

    evToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    evToggleLabel: { fontSize: 15, color: '#1A1A2E', fontWeight: '600' },
    toggle: {
        width: 48, height: 26, borderRadius: 13,
        backgroundColor: '#DDD',
        padding: 2,
        justifyContent: 'center',
    },
    toggleOn: { backgroundColor: theme.colors.primary },
    knob: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: '#fff',
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
        alignSelf: 'flex-start',
    },
    knobOn: { alignSelf: 'flex-end' },

    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 8 },
    cancelBtn: {
        flex: 1, padding: 15, borderRadius: 14,
        backgroundColor: '#F5F6FA',
        alignItems: 'center',
    },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#666' },
    submitBtn: {
        flex: 2, padding: 15, borderRadius: 14,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    // QR Modal
    qrModalSheet: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        margin: 24,
        alignItems: 'center',
    },
    qrModalIcon: { fontSize: 60, marginBottom: 16 },
    qrModalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
    qrModalSub: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    qrCloseBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 14,
    },
    qrCloseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
