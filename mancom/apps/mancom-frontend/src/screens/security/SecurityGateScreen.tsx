import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, FlatList, Modal, ActivityIndicator } from 'react-native';
import { apiClient } from '../../core/api/client';
import { theme } from '../../config/theme';

export function SecurityGateScreen() {
    const [plateNumber, setPlateNumber] = useState('');
    const [visitorName, setVisitorName] = useState('');
    const [flatNumber, setFlatNumber] = useState('');
    const [showScanModal, setShowScanModal] = useState(false);
    const [scanToken, setScanToken] = useState('');
    const [scanning, setScanning] = useState(false);

    const activeEntries = [
        { id: '1', name: 'Swiggy Delivery', type: 'Delivery', time: '10:05 AM', flat: 'A-201' },
        { id: '2', name: 'Rahul Sharma', type: 'Guest', time: '11:15 AM', flat: 'B-305' },
    ];

    const handleGrantEntry = () => {
        if (!visitorName || !flatNumber) {
            Alert.alert("Error", "Visitor name and Flat number are required.");
            return;
        }
        Alert.alert("Success", "Access granted. Notification sent to flat.");
        setVisitorName('');
        setPlateNumber('');
        setFlatNumber('');
    };

    const handleScanPass = async () => {
        if (!scanToken.trim()) return Alert.alert('Error', 'Please enter a token');
        setScanning(true);
        try {
            // Find by token first
            const res = await apiClient.get(`/visitors/passes/scan/${scanToken}`);
            const pass = res.data;

            if (pass.status !== 'pending') {
                return Alert.alert('Error', `Pass is already ${pass.status}`);
            }

            // Mark arrived
            await apiClient.patch(`/visitors/passes/arrive/${scanToken}`);

            Alert.alert('Access Granted', `Pass verified for ${pass.visitorName}. Entry recorded.`);
            setShowScanModal(false);
            setScanToken('');
        } catch (e: any) {
            Alert.alert('Invalid Pass', e?.response?.data?.message || 'The token is invalid or expired.');
        } finally {
            setScanning(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Gate #1 Duty</Text>
                    <Text style={styles.subtitle}>Current Status: On Duty</Text>
                </View>
                <TouchableOpacity onPress={() => setShowScanModal(true)} style={styles.scanBtn}>
                    <Text style={styles.scanBtnText}>📸 Scan QR</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* QR Scan Simulation Modal */}
                <Modal visible={showScanModal} animationType="fade" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.scanModal}>
                            <Text style={styles.modalTitle}>Scan Visitor QR</Text>
                            <Text style={styles.modalSub}>Enter the 8-character token from the visitor's pass</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. A1B2C3D4"
                                value={scanToken}
                                onChangeText={setScanToken}
                                autoCapitalize="characters"
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalCancel}
                                    onPress={() => { setShowScanModal(false); setScanToken(''); }}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalSubmit, scanning && { opacity: 0.7 }]}
                                    onPress={handleScanPass}
                                    disabled={scanning}
                                >
                                    {scanning ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.modalSubmitText}>Verify Pass</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* New Entry Form */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Process New Entry</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Visitor / Company Name"
                        value={visitorName}
                        onChangeText={setVisitorName}
                    />

                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: theme.spacing.md }]}
                            placeholder="To Flat (e.g. A-101)"
                            value={flatNumber}
                            onChangeText={setFlatNumber}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Vehicle No. (Opt)"
                            value={plateNumber}
                            onChangeText={setPlateNumber}
                        />
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => setVisitorName('')}>
                            <Text style={styles.btnRejectText}>Deny</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={handleGrantEntry}>
                            <Text style={styles.btnApproveText}>Grant Access</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Inside Premises */}
                <Text style={styles.sectionTitle}>Inside Premises currently</Text>
                <FlatList
                    data={activeEntries}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.listCard}>
                            <View style={styles.listCardContent}>
                                <Text style={styles.listName}>{item.name}</Text>
                                <Text style={styles.listSubtitle}>{item.type} • Flat {item.flat} • In at {item.time}</Text>
                            </View>
                            <TouchableOpacity style={styles.checkoutBtn}>
                                <Text style={styles.checkoutText}>Check Out</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    subtitle: { fontSize: 13, color: theme.colors.success, fontWeight: theme.fontWeight.medium },
    logoutBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    logoutBtnText: { color: theme.colors.error, fontWeight: theme.fontWeight.bold, fontSize: 12 },

    content: { padding: theme.spacing.lg },
    sectionTitle: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.md, marginTop: theme.spacing.sm },

    card: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border },
    input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, fontSize: 15 },
    row: { flexDirection: 'row' },
    actionRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm },
    btn: { flex: 1, padding: 14, borderRadius: theme.borderRadius.md, alignItems: 'center' },
    btnReject: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
    btnRejectText: { color: theme.colors.error, fontWeight: theme.fontWeight.bold },
    btnApprove: { backgroundColor: theme.colors.primary },
    btnApproveText: { color: theme.colors.surface, fontWeight: theme.fontWeight.bold },

    listCard: { backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    listCardContent: { flex: 1 },
    listName: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    listSubtitle: { fontSize: 12, color: theme.colors.text.secondary },
    checkoutBtn: { backgroundColor: theme.colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border },
    checkoutText: { fontSize: 12, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    scanBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    scanModal: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
    modalSub: { fontSize: 14, color: '#666', marginBottom: 20 },
    modalInput: { backgroundColor: '#F5F6FA', borderRadius: 12, padding: 16, fontSize: 18, color: '#1A1A2E', borderWidth: 1, borderColor: '#EBEBEB', textAlign: 'center', letterSpacing: 4, fontWeight: '700', marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalCancel: { flex: 1, padding: 15, borderRadius: 14, backgroundColor: '#F5F6FA', alignItems: 'center' },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: '#666' },
    modalSubmit: { flex: 2, padding: 15, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center' },
    modalSubmitText: { fontSize: 15, fontWeight: '700', color: '#fff' }
});
