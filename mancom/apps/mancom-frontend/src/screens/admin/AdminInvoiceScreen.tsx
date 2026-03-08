import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

export function AdminInvoiceScreen() {
    const navigation = useNavigation();

    const invoices = [
        { id: '1', flat: 'A-101', amount: '₹4,500', status: 'Pending' },
        { id: '2', flat: 'B-205', amount: '₹4,500', status: 'Paid' },
        { id: '3', flat: 'C-302', amount: '₹5,000', status: 'Overdue' }
    ];

    const generateAllInvoices = () => {
        Alert.alert("Success", "Maintenance invoices generated for all flats for this month.");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Manage Invoices</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={styles.content}>
                <TouchableOpacity style={styles.generateBtn} onPress={generateAllInvoices}>
                    <Text style={styles.generateBtnText}>+ Generate Monthly Invoices</Text>
                </TouchableOpacity>

                <Text style={styles.subheading}>Recent Invoices</Text>
                <FlatList
                    data={invoices}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.invoiceCard}>
                            <View>
                                <Text style={styles.flatText}>Flat {item.flat}</Text>
                                <Text style={styles.amountText}>{item.amount}</Text>
                            </View>
                            <View style={[styles.statusBadge, {
                                backgroundColor: item.status === 'Paid' ? theme.colors.success + '20' : item.status === 'Overdue' ? theme.colors.error + '20' : theme.colors.warning + '20'
                            }]}>
                                <Text style={[styles.statusText, {
                                    color: item.status === 'Paid' ? theme.colors.success : item.status === 'Overdue' ? theme.colors.error : theme.colors.warning
                                }]}>{item.status}</Text>
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
    generateBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', marginBottom: theme.spacing.xl },
    generateBtnText: { color: theme.colors.surface, fontWeight: theme.fontWeight.bold, fontSize: 16 },
    subheading: { fontSize: 16, fontWeight: theme.fontWeight.bold, marginBottom: theme.spacing.md, color: theme.colors.text.secondary },
    invoiceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
    flatText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    amountText: { fontSize: 14, color: theme.colors.text.secondary },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: theme.fontWeight.bold }
});
