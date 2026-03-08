import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

interface Document {
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
}

export function DocumentsScreen() {
    const navigation = useNavigation();
    const [documents] = useState<Document[]>([
        { id: '1', name: 'Lease_Agreement_A101.pdf', type: '📄', date: 'Oct 12, 2025', size: '2.4 MB' },
        { id: '2', name: 'Electricity_Bill_Sept.pdf', type: '🧾', date: 'Sep 28, 2025', size: '1.1 MB' },
        { id: '3', name: 'ID_Proof_Jane.jpg', type: '🖼️', date: 'Jan 05, 2025', size: '4.5 MB' },
    ]);

    const handleUpload = () => {
        Alert.alert('Upload Document', 'File picker will open here. (Coming Soon)');
    };

    const handleDocumentPress = (docName: string) => {
        Alert.alert('View Document', `Opening ${docName}...`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Documents</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                    <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Recent Uploads</Text>
                {documents.map(doc => (
                    <TouchableOpacity key={doc.id} style={styles.card} onPress={() => handleDocumentPress(doc.name)}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>{doc.type}</Text>
                        </View>
                        <View style={styles.docInfo}>
                            <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                            <Text style={styles.docDetails}>{doc.date} • {doc.size}</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                ))}

                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>📁</Text>
                    <Text style={styles.emptyStateText}>Securely store all your society-related documents here.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backButton: { width: 60 },
    backButtonText: { fontSize: 16, color: theme.colors.primary },
    title: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    uploadButton: { width: 60, alignItems: 'flex-end' },
    uploadButtonText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
    content: { flex: 1, padding: theme.spacing.lg },
    sectionTitle: { fontSize: 14, fontWeight: theme.fontWeight.bold, color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: theme.spacing.md, letterSpacing: 0.5 },

    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    icon: { fontSize: 24 },
    docInfo: { flex: 1, justifyContent: 'center' },
    docName: { fontSize: 15, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    docDetails: { fontSize: 12, color: theme.colors.text.secondary },
    chevron: { fontSize: 20, color: theme.colors.text.disabled, paddingLeft: theme.spacing.sm },

    emptyState: { marginTop: 40, alignItems: 'center', padding: theme.spacing.xl },
    emptyStateIcon: { fontSize: 48, opacity: 0.5, marginBottom: theme.spacing.md },
    emptyStateText: { textAlign: 'center', color: theme.colors.text.secondary, fontSize: 14, lineHeight: 20 }
});
