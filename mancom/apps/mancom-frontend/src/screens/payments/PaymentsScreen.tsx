import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadPayments, selectPayments } from '../../store/slices/paymentSlice';
import { theme } from '../../config/theme';

export function PaymentsScreen() {
    const dispatch = useAppDispatch();
    const payments = useAppSelector(selectPayments);

    const [showPaymentSheet, setShowPaymentSheet] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

    useEffect(() => {
        dispatch(loadPayments());
    }, [dispatch]);

    const handlePayNow = () => {
        setShowPaymentSheet(true);
    };

    const confirmPayment = () => {
        // mock success
        setShowPaymentSheet(false);
        Alert.alert('Success', 'Payment Successful!');
    };

    // Aggregate values
    const totalDue = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.totalAmount, 0);
    const totalBase = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPenalty = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + (p.penalty || 0), 0);

    // Mock grouping
    const marchPayments = payments.filter(p => p.description.includes('March') || p.status === 'overdue');
    const earlierPayments = payments.filter(p => !marchPayments.includes(p));

    const renderStatusPill = (status: 'paid' | 'pending' | 'overdue') => {
        switch (status) {
            case 'paid':
                return (
                    <View style={[styles.statusPill, { backgroundColor: '#E6F9F4' }]}>
                        <Text style={[styles.statusText, { color: theme.colors.success }]}>Paid</Text>
                    </View>
                );
            case 'pending':
                return (
                    <View style={[styles.statusPill, { backgroundColor: '#FFF7E6' }]}>
                        <Text style={[styles.statusText, { color: theme.colors.warning }]}>Pending</Text>
                    </View>
                );
            case 'overdue':
                return (
                    <View style={[styles.statusPill, { backgroundColor: '#FFEDED' }]}>
                        <Text style={[styles.statusText, { color: theme.colors.error }]}>Overdue</Text>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Payments</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total Dues</Text>
                    <Text style={styles.summaryAmount}>₹{totalDue.toLocaleString()}</Text>

                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownText}>₹{totalBase.toLocaleString()} Maintenance</Text>
                        <View style={styles.dotSeparator} />
                        <Text style={styles.breakdownText}>₹{totalPenalty.toLocaleString()} Late Fee</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.payNowBtn, totalDue === 0 && { opacity: 0.5 }]}
                        onPress={handlePayNow}
                        disabled={totalDue === 0}
                    >
                        <Text style={styles.payNowBtnText}>Pay Full Amount</Text>
                    </TouchableOpacity>
                </View>

                {/* Invoices List */}
                <View style={styles.invoiceSection}>
                    <Text style={styles.monthHeader}>March 2024</Text>

                    {marchPayments.map((item, index) => (
                        <View key={item.id || index} style={styles.invoiceRow}>
                            <View style={styles.invoiceLeft}>
                                <Text style={styles.invoiceDesc}>{item.description}</Text>
                                <Text style={styles.invoiceDate}>Due: {item.dueDate}</Text>
                            </View>
                            <View style={styles.invoiceRight}>
                                <Text style={styles.invoiceAmount}>₹{item.totalAmount.toLocaleString()}</Text>
                                {renderStatusPill(item.status as any)}
                            </View>
                        </View>
                    ))}

                    {earlierPayments.length > 0 && (
                        <>
                            <Text style={[styles.monthHeader, { marginTop: 24 }]}>Earlier</Text>
                            {earlierPayments.map((item, index) => (
                                <View key={item.id || index} style={styles.invoiceRow}>
                                    <View style={styles.invoiceLeft}>
                                        <Text style={styles.invoiceDesc}>{item.description}</Text>
                                        <Text style={styles.invoiceDate}>Due: {item.dueDate}</Text>
                                    </View>
                                    <View style={styles.invoiceRight}>
                                        <Text style={styles.invoiceAmount}>₹{item.totalAmount.toLocaleString()}</Text>
                                        {renderStatusPill(item.status as any)}
                                    </View>
                                </View>
                            ))}
                        </>
                    )}
                </View>

            </ScrollView>

            {/* Payment Bottom Sheet */}
            <Modal visible={showPaymentSheet} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.sheetTitle}>Complete Payment</Text>
                        <Text style={styles.sheetSub}>Select your preferred payment method</Text>

                        <Text style={styles.amountToPay}>₹{totalDue.toLocaleString()}</Text>

                        <View style={styles.methodContainer}>
                            <TouchableOpacity
                                style={[styles.methodBtn, selectedMethod === 'upi' && styles.methodBtnActive]}
                                onPress={() => setSelectedMethod('upi')}
                            >
                                <View style={styles.methodIconView}><Text style={styles.iconTxt}>📱</Text></View>
                                <Text style={[styles.methodTxt, selectedMethod === 'upi' && styles.methodTxtActive]}>UPI</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.methodBtn, selectedMethod === 'card' && styles.methodBtnActive]}
                                onPress={() => setSelectedMethod('card')}
                            >
                                <View style={styles.methodIconView}><Text style={styles.iconTxt}>💳</Text></View>
                                <Text style={[styles.methodTxt, selectedMethod === 'card' && styles.methodTxtActive]}>Card</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.methodBtn, selectedMethod === 'netbanking' && styles.methodBtnActive]}
                                onPress={() => setSelectedMethod('netbanking')}
                            >
                                <View style={styles.methodIconView}><Text style={styles.iconTxt}>🏦</Text></View>
                                <Text style={[styles.methodTxt, selectedMethod === 'netbanking' && styles.methodTxtActive]}>Netbank</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.confirmBtn} onPress={confirmPayment}>
                            <Text style={styles.confirmBtnText}>Pay ₹{totalDue.toLocaleString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPaymentSheet(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.sm },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    scrollContent: { padding: theme.spacing.lg, paddingBottom: 100 },

    summaryCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 4,
    },
    summaryTitle: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, fontWeight: theme.fontWeight.medium, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },
    summaryAmount: { fontSize: 40, fontWeight: theme.fontWeight.bold, color: theme.colors.primary, marginBottom: theme.spacing.md },
    breakdownRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, marginBottom: theme.spacing.xl },
    breakdownText: { fontSize: 13, color: theme.colors.text.secondary, fontWeight: theme.fontWeight.medium },
    dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.text.disabled, marginHorizontal: theme.spacing.sm },

    payNowBtn: { width: '100%', height: 56, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
    payNowBtnText: { color: theme.colors.surface, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold },

    invoiceSection: { marginTop: theme.spacing.sm },
    monthHeader: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.md },

    invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    invoiceLeft: { flex: 1, paddingRight: theme.spacing.md },
    invoiceDesc: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium, color: theme.colors.text.primary, marginBottom: 4 },
    invoiceDate: { fontSize: 13, color: theme.colors.text.secondary },
    invoiceRight: { alignItems: 'flex-end' },
    invoiceAmount: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 6 },

    statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: theme.fontWeight.bold },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.4)', justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, padding: theme.spacing.lg, paddingBottom: 40 },
    dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: theme.spacing.lg },
    sheetTitle: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    sheetSub: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing.xl },

    amountToPay: { fontSize: 32, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing.xl },

    methodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xxl },
    methodBtn: { flex: 1, alignItems: 'center', padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.lg, marginHorizontal: 4 },
    methodBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
    methodIconView: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
    iconTxt: { fontSize: 20 },
    methodTxt: { fontSize: 13, fontWeight: theme.fontWeight.medium, color: theme.colors.text.secondary },
    methodTxtActive: { color: theme.colors.primary, fontWeight: theme.fontWeight.bold },

    confirmBtn: { width: '100%', height: 56, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
    confirmBtnText: { color: theme.colors.surface, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold },
    cancelBtn: { width: '100%', height: 50, justifyContent: 'center', alignItems: 'center' },
    cancelBtnText: { color: theme.colors.text.secondary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium },
});

export default PaymentsScreen;
