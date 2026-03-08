import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

export function AdminAnnounceScreen() {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const handleSend = () => {
        Alert.alert("Sent", "Notice broadcasted to all residents.", [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>New Announcement</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={styles.content}>
                <Text style={styles.label}>Title</Text>
                <TextInput style={styles.input} placeholder="e.g. Water Storage Maintenance" value={title} onChangeText={setTitle} />

                <Text style={styles.label}>Message</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Type your message here..." multiline numberOfLines={5} value={message} onChangeText={setMessage} />

                <TouchableOpacity style={styles.submitBtn} onPress={handleSend}>
                    <Text style={styles.submitText}>Broadcast Notice 📢</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Keeping CSS simple for MVP
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg, borderBottomWidth: 1, borderColor: theme.colors.border },
    backButton: { width: 60 },
    backBtnText: { color: theme.colors.primary, fontSize: 16 },
    title: { fontSize: 18, fontWeight: theme.fontWeight.bold },
    content: { padding: theme.spacing.lg },
    label: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.text.secondary, marginBottom: 8, marginTop: theme.spacing.md },
    input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: 16 },
    textArea: { height: 120, textAlignVertical: 'top' },
    submitBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.lg, padding: 16, alignItems: 'center', marginTop: theme.spacing.xxl },
    submitText: { color: theme.colors.surface, fontSize: 16, fontWeight: theme.fontWeight.bold }
});
