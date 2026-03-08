import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import { loadProfile } from '../../store/slices/profileSlice';

export function EditProfileScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);

    const [name, setName] = useState(user?.name || 'Jane Doe');
    const [phone, setPhone] = useState(user?.phone || '+91 9876543210');
    const [email, setEmail] = useState(user?.email || 'jane.doe@example.com');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const handleAvatarUpload = () => {
        Alert.alert(
            'Change Photo',
            'Choose an option',
            [
                {
                    text: 'Take Photo', onPress: () => {
                        // MOCK taking a photo
                        setAvatarUri('https://i.pravatar.cc/150?img=47');
                    }
                },
                {
                    text: 'Choose from Library', onPress: () => {
                        // MOCK picking from library
                        setAvatarUri('https://i.pravatar.cc/150?img=32');
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleSave = () => {
        // Mock save logic, you would dispatch a thunk to save profile here
        Alert.alert('Success', 'Profile details updated successfully!', [
            {
                text: 'OK', onPress: () => {
                    // mock reloading the profile after save
                    dispatch(loadProfile());
                    navigation.goBack();
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : '👤'}</Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.changePhotoBtn} onPress={handleAvatarUpload}>
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="Enter your phone number"
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="Enter your email address"
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                    </View>

                    {/* Non-editable details like flat number */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Flat Number (View Only)</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value="A-101"
                            editable={false}
                        />
                        <Text style={styles.helperText}>Contact the society office to change your flat details.</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backButton: { width: 60 },
    backButtonText: { fontSize: 16, color: theme.colors.text.secondary },
    title: { fontSize: 18, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    saveButton: { width: 60, alignItems: 'flex-end' },
    saveButtonText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },

    content: { padding: theme.spacing.lg },

    avatarContainer: { alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.md },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md, overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { fontSize: 32, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
    changePhotoBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    changePhotoText: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.primary },

    formGroup: { marginBottom: theme.spacing.lg },
    label: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.text.secondary, marginBottom: 8 },
    input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: 16, color: theme.colors.text.primary },
    readOnlyInput: { backgroundColor: '#F3F4F6', color: theme.colors.text.secondary },
    helperText: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 6, marginLeft: 4 }
});
