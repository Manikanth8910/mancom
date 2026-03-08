import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAdminMode, setUserMode, setSecurityMode, setSuperadminMode, selectUser } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';

export function DemoRoleSwitcher() {
    const [modalVisible, setModalVisible] = useState(false);
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);

    // If user is not logged in, don't show the switcher
    if (!user) return null;

    const currentRole = user.role?.toUpperCase();

    const handleRoleChange = (roleSetAction: any) => {
        dispatch(roleSetAction());
        setModalVisible(false);
    };

    return (
        <>
            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>🔄</Text>
            </TouchableOpacity>

            {/* Modal Switcher */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Demo Role Switcher</Text>
                            <Text style={styles.subtitle}>Current Role: {currentRole}</Text>
                        </View>

                        <TouchableOpacity style={styles.roleBtn} onPress={() => handleRoleChange(setUserMode)}>
                            <Text style={styles.roleIcon}>🏠</Text>
                            <Text style={styles.roleText}>Resident (User)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.roleBtn} onPress={() => handleRoleChange(setAdminMode)}>
                            <Text style={styles.roleIcon}>📊</Text>
                            <Text style={styles.roleText}>Society Admin</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.roleBtn} onPress={() => handleRoleChange(setSecurityMode)}>
                            <Text style={styles.roleIcon}>🛡️</Text>
                            <Text style={styles.roleText}>Security Guard</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.roleBtn} onPress={() => handleRoleChange(setSuperadminMode)}>
                            <Text style={styles.roleIcon}>🌍</Text>
                            <Text style={styles.roleText}>Superadmin</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        backgroundColor: '#1E293B',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 1000,
    },
    fabIcon: {
        fontSize: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        elevation: 5,
    },
    header: {
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    roleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    roleIcon: {
        fontSize: 24,
        marginRight: theme.spacing.md,
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    closeBtn: {
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    closeBtnText: {
        color: theme.colors.error,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
