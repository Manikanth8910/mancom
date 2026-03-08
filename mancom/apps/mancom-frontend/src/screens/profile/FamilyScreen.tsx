import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    age: string;
}

export function FamilyScreen() {
    const navigation = useNavigation();
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRelation, setNewRelation] = useState('');
    const [newAge, setNewAge] = useState('');

    const handleAddMember = () => {
        if (!newName || !newRelation || !newAge) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        const newMember = {
            id: Date.now().toString(),
            name: newName,
            relation: newRelation,
            age: newAge
        };
        setMembers([...members, newMember]);
        setAddModalVisible(false);
        setNewName('');
        setNewRelation('');
        setNewAge('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Family</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
                {members.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No family members added yet.</Text>
                    </View>
                ) : (
                    members.map(member => (
                        <View key={member.id} style={styles.card}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <Text style={styles.memberDetails}>{member.relation} • Age {member.age}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Family Member</Text>

                        <TextInput style={styles.input} placeholder="Full Name" value={newName} onChangeText={setNewName} placeholderTextColor={theme.colors.text.disabled} />
                        <TextInput style={styles.input} placeholder="Relationship (e.g., Spouse, Child)" value={newRelation} onChangeText={setNewRelation} placeholderTextColor={theme.colors.text.disabled} />
                        <TextInput style={styles.input} placeholder="Age" value={newAge} onChangeText={setNewAge} keyboardType="numeric" placeholderTextColor={theme.colors.text.disabled} />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setAddModalVisible(false)}>
                                <Text style={styles.modalCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalSaveBtn]} onPress={handleAddMember}>
                                <Text style={styles.modalSaveBtnText}>Save</Text>
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
    addButton: { width: 60, alignItems: 'flex-end' },
    addButtonText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
    content: { flex: 1, padding: theme.spacing.lg },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    avatarText: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    memberDetails: { fontSize: 14, color: theme.colors.text.secondary },

    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
    emptyText: { color: theme.colors.text.disabled, fontSize: 14, marginTop: 20 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl },
    modalTitle: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.lg },
    input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, fontSize: 16, color: theme.colors.text.primary },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: theme.borderRadius.md, alignItems: 'center' },
    modalCancelBtn: { backgroundColor: theme.colors.background, marginRight: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
    modalSaveBtn: { backgroundColor: theme.colors.primary, marginLeft: theme.spacing.sm },
    modalCancelBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    modalSaveBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.surface }
});
