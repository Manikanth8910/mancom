import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

export function PetsScreen() {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Pets</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={styles.content}>
                <Text style={styles.placeholderText}>Manage your family pets here.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md },
    backButton: { width: 60 },
    backButtonText: { fontSize: 16, color: theme.colors.primary },
    title: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    content: { flex: 1, padding: theme.spacing.lg, alignItems: 'center', justifyContent: 'center' },
    placeholderText: { fontSize: 16, color: theme.colors.text.secondary },
});
