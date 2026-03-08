import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../config/theme';

export function SecurityResidentsScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    const [residentsList] = useState<any[]>([]);

    const filteredResidents = residentsList.filter(resident =>
        resident.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCall = (phone: string) => {
        Alert.alert('Calling...', `Dialing ${phone}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Resident Directory</Text>
                <Text style={styles.subtitle}>Check instructions & contact details</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by Flat No. or Name..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.content}>
                <FlatList
                    data={filteredResidents}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.titleRow}>
                                    <View style={styles.flatBadge}>
                                        <Text style={styles.flatText}>{item.flat}</Text>
                                    </View>
                                    <Text style={styles.nameText}>{item.name}</Text>
                                </View>
                                <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.phone)}>
                                    <Text style={styles.callText}>📞 Call</Text>
                                </TouchableOpacity>
                            </View>

                            {item.instruction ? (
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Resident Instruction:</Text>
                                    <Text style={styles.infoText}>{item.instruction}</Text>
                                </View>
                            ) : null}

                            {item.expecting ? (
                                <View style={[styles.infoBox, { backgroundColor: '#FFFBEB', borderColor: theme.colors.warning }]}>
                                    <Text style={[styles.infoLabel, { color: theme.colors.warning }]}>Expecting Today:</Text>
                                    <Text style={styles.infoText}>{item.expecting}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No residents found matching that query.</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    subtitle: { fontSize: 13, color: theme.colors.text.secondary },

    searchContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderColor: theme.colors.border },
    searchInput: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: 15 },

    content: { flex: 1, padding: theme.spacing.lg },

    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    flatBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginRight: theme.spacing.sm },
    flatText: { color: theme.colors.surface, fontWeight: theme.fontWeight.bold, fontSize: 13 },
    nameText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, flex: 1 },

    callBtn: { backgroundColor: theme.colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border },
    callText: { fontSize: 12, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    infoBox: { backgroundColor: '#F3F4F6', padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
    infoLabel: { fontSize: 11, fontWeight: theme.fontWeight.bold, color: theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: 2 },
    infoText: { fontSize: 14, color: theme.colors.text.primary },

    emptyText: { textAlign: 'center', color: theme.colors.text.disabled, marginTop: theme.spacing.xl }
});
