import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, setUserMode, selectUser } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';

export function SecurityProfileScreen() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);

    const handleSwitchToResident = () => {
        dispatch(setUserMode());
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Guard Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>🛡️</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user?.name || 'Ramesh Singh'}</Text>
                        <Text style={styles.roleText}>Security Guard • Day Shift</Text>
                    </View>
                </View>

                <View style={styles.menuGroup}>
                    <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('Check-in', 'Attendance logged via biometric scanner.')}>
                        <Text style={styles.menuIcon}>📸</Text>
                        <Text style={styles.menuLabel}>Log Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('Pending', 'No outstanding leave requests.')}>
                        <Text style={styles.menuIcon}>🗓️</Text>
                        <Text style={styles.menuLabel}>My Roster & Leaves</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchToResident}>
                    <Text style={styles.switchBtnText}>Switch to User View (Dev)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
                    <Text style={styles.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    content: { padding: theme.spacing.lg },

    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.sm },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.lg },
    avatarText: { fontSize: 28 },
    profileInfo: { flex: 1, justifyContent: 'center' },
    name: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    roleText: { fontSize: 13, color: theme.colors.text.secondary },

    menuGroup: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
    menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: theme.spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
    menuIcon: { fontSize: 20, marginRight: theme.spacing.md, width: 24, textAlign: 'center' },
    menuLabel: { fontSize: 15, color: theme.colors.text.primary, fontWeight: '500' },

    switchBtn: { backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.lg, paddingVertical: 16, alignItems: 'center', marginTop: theme.spacing.lg },
    switchBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },

    logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: theme.borderRadius.lg, paddingVertical: 16, alignItems: 'center', marginTop: theme.spacing.md, borderWidth: 1, borderColor: '#FECACA' },
    logoutBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.error },
});
