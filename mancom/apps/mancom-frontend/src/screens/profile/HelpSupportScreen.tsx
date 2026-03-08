import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export function HelpSupportScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isTicketModalVisible, setTicketModalVisible] = useState(false);
    const [ticketMessage, setTicketMessage] = useState('');

    const faqs: FAQ[] = [
        { id: '1', question: 'How do I add a new family member?', answer: 'Go to Profile > My Family, and click on the "Add" button at the top right of the screen. Fill in their details and hit Save.' },
        { id: '2', question: 'How can I pay maintenance bills?', answer: 'Navigate to the Payments tab from the bottom navigation. You will see all pending dues there.' },
        { id: '3', question: 'Who can approve visitors?', answer: 'By default, any family member added to your account and marked as an adult can approve standard visitors via the Visitors tab.' },
        { id: '4', question: 'How do I change my passcode?', answer: 'Go to Profile > Settings > Security & Access, and tap on "Change Passcode".' }
    ];

    const handleSubmitTicket = () => {
        if (!ticketMessage.trim()) {
            Alert.alert('Error', 'Please describe your problem.');
            return;
        }

        Alert.alert('Success', 'Your support ticket has been submitted. Our team will get back to you shortly.', [
            {
                text: 'OK', onPress: () => {
                    setTicketModalVisible(false);
                    setTicketMessage('');
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Help & Support</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for help topics..."
                        placeholderTextColor={theme.colors.text.disabled}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Contact Options */}
                <Text style={styles.sectionTitle}>Contact Us directly</Text>
                <View style={styles.contactCardsRow}>
                    <TouchableOpacity style={styles.contactCard} onPress={() => Alert.alert('Call', 'Opening Dialer...')}>
                        <View style={[styles.contactIconWrapper, { backgroundColor: '#DBEAFE' }]}>
                            <Text style={styles.contactIcon}>📞</Text>
                        </View>
                        <Text style={styles.contactLabel}>Call Society{"\n"}Office</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard} onPress={() => setTicketModalVisible(true)}>
                        <View style={[styles.contactIconWrapper, { backgroundColor: '#DCFCE7' }]}>
                            <Text style={styles.contactIcon}>💬</Text>
                        </View>
                        <Text style={styles.contactLabel}>Raise Support{"\n"}Ticket</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQs */}
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <View style={styles.faqList}>
                    {faqs.map(faq => (
                        <View key={faq.id} style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Support Ticket Modal */}
            <Modal visible={isTicketModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Submit a Request</Text>
                        <Text style={styles.modalSubtitle}>Describe your issue or feedback in detail and we'll get back to you via email.</Text>

                        <TextInput
                            style={styles.textArea}
                            placeholder="Type your message here..."
                            value={ticketMessage}
                            onChangeText={setTicketMessage}
                            placeholderTextColor={theme.colors.text.disabled}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setTicketModalVisible(false)}>
                                <Text style={styles.modalCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalSaveBtn]} onPress={handleSubmitTicket}>
                                <Text style={styles.modalSaveBtnText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backButton: { width: 60 },
    backButtonText: { fontSize: 16, color: theme.colors.primary },
    title: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    content: { flex: 1, padding: theme.spacing.lg },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: 12, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border },
    searchIcon: { fontSize: 18, marginRight: theme.spacing.sm },
    searchInput: { flex: 1, fontSize: 16, color: theme.colors.text.primary },

    sectionTitle: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.md },

    contactCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xl },
    contactCard: { flex: 0.48, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
    contactIconWrapper: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
    contactIcon: { fontSize: 24 },
    contactLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text.primary, textAlign: 'center', lineHeight: 20 },

    faqList: { gap: theme.spacing.md },
    faqItem: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    faqQuestion: { fontSize: 15, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 8, lineHeight: 22 },
    faqAnswer: { fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl },
    modalTitle: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: theme.spacing.lg, lineHeight: 20 },
    textArea: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, fontSize: 16, color: theme.colors.text.primary, minHeight: 120 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: theme.borderRadius.md, alignItems: 'center' },
    modalCancelBtn: { backgroundColor: theme.colors.background, marginRight: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
    modalSaveBtn: { backgroundColor: theme.colors.primary, marginLeft: theme.spacing.sm },
    modalCancelBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    modalSaveBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.surface }
});
