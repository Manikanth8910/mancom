import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Loading } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { loadProfile, selectProfile, selectIsProfileLoading } from '../../store/slices/profileSlice';
import { logout, setAdminMode, setSecurityMode, setSuperadminMode } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';

export function ProfileScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const profile = useAppSelector(selectProfile);
    const isLoading = useAppSelector(selectIsProfileLoading);

    useEffect(() => {
        dispatch(loadProfile());
    }, [dispatch]);

    const handleDevSwitch = (mode: 'admin' | 'security' | 'superadmin') => {
        if (mode === 'admin') {
            dispatch(setAdminMode());
            Alert.alert('Role Updated', 'You are now viewing as a Society Admin.', [{ text: 'OK' }]);
        } else if (mode === 'security') {
            dispatch(setSecurityMode());
            Alert.alert('Role Updated', 'You are now viewing as Security Staff.', [{ text: 'OK' }]);
        } else if (mode === 'superadmin') {
            dispatch(setSuperadminMode());
            Alert.alert('Role Updated', 'You are now viewing as Global Superadmin.', [{ text: 'OK' }]);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: () => dispatch(logout())
                }
            ]
        );
    };

    if (isLoading && !profile) return <Loading message="Loading profile..." />;

    const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '👤';

    const handleMenuPress = (label: string) => {
        switch (label) {
            case 'My Family': return navigation.navigate('Family');
            case 'Documents': return navigation.navigate('Documents');
            case 'Pets': return navigation.navigate('Pets');
            case 'Settings': return navigation.navigate('Settings');
            case 'Privacy & Security': return navigation.navigate('Privacy');
            case 'Help & Support': return navigation.navigate('HelpSupport');
            default:
                Alert.alert('Coming Soon', `${label} feature is not yet available.`);
        }
    };

    const renderMenuRow = (icon: string, label: string, isLast = false) => (
        <TouchableOpacity style={styles.menuRow} onPress={() => handleMenuPress(label)}>
            <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>{icon}</Text>
                <Text style={styles.menuLabel}>{label}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
            {!isLast && <View style={styles.menuDivider} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {profile && (
                    <TouchableOpacity style={styles.profileHeader} onPress={() => navigation.navigate('EditProfile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{profile.name}</Text>
                            <Text style={styles.flatText}>{profile.flatId} • {profile.societyName}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>RESIDENT</Text>
                            </View>
                        </View>
                        <Text style={styles.editIcon}>✎</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.menuGroup}>
                    {renderMenuRow('👨‍👩‍👧‍👦', 'My Family')}
                    {renderMenuRow('🚗', 'Vehicles')}
                    {renderMenuRow('📄', 'Documents')}
                    {renderMenuRow('🐕', 'Pets', true)}
                </View>

                <View style={styles.menuGroup}>
                    {renderMenuRow('⚙️', 'Settings')}
                    {renderMenuRow('🔒', 'Privacy & Security')}
                    {renderMenuRow('❓', 'Help & Support', true)}
                </View>

                {/* Developer Mode Toggle */}
                <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                    <TouchableOpacity onPress={() => handleDevSwitch('superadmin')} style={[styles.adminToggleBtn, { backgroundColor: '#1E1B4B' }]}>
                        <Text style={[styles.adminToggleText, { color: '#E0E7FF' }]}>Switch to Superadmin View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDevSwitch('admin')} style={styles.adminToggleBtn}>
                        <Text style={styles.adminToggleText}>Switch to Admin View (Dev)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDevSwitch('security')} style={styles.adminToggleBtn}>
                        <Text style={styles.adminToggleText}>Switch to Security View (Dev)</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>ManCom App v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },

    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl, marginTop: theme.spacing.sm },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.lg },
    avatarText: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
    profileInfo: { flex: 1, justifyContent: 'center' },
    name: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    flatText: { fontSize: 13, color: theme.colors.text.secondary, marginBottom: 6 },
    roleBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    roleText: { fontSize: 10, fontWeight: theme.fontWeight.bold, color: theme.colors.surface },
    editIcon: { fontSize: 24, color: theme.colors.text.disabled, paddingLeft: theme.spacing.md },

    menuGroup: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
    menuRow: { position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: theme.spacing.md },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIcon: { fontSize: 18, width: 32 },
    menuLabel: { fontSize: 15, fontWeight: theme.fontWeight.medium, color: theme.colors.text.primary },
    chevron: { fontSize: 20, color: theme.colors.text.disabled, paddingBottom: 2 },
    menuDivider: { position: 'absolute', bottom: 0, left: 48, right: 0, height: 1, backgroundColor: theme.colors.border },

    logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: theme.borderRadius.lg, paddingVertical: 16, alignItems: 'center', marginTop: theme.spacing.md, borderWidth: 1, borderColor: '#FECACA' },
    logoutBtnText: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.error },

    adminToggleBtn: { backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.lg, paddingVertical: 14, alignItems: 'center' },
    adminToggleText: { fontSize: 14, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },

    versionText: { textAlign: 'center', marginTop: theme.spacing.xl, fontSize: 12, color: theme.colors.text.disabled },
});

export default ProfileScreen;
