import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: 'alert' | 'info' | 'success';
}

export function NotificationsScreen() {
    const navigation = useNavigation();

    // Mock Notifications data
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const renderNotification = ({ item }: { item: NotificationItem }) => {
        const getIconColor = () => {
            switch (item.type) {
                case 'alert': return theme.colors.error;
                case 'success': return theme.colors.success;
                case 'info': return theme.colors.primary;
                default: return theme.colors.text.secondary;
            }
        };

        const getIconMsg = () => {
            switch (item.type) {
                case 'alert': return '⚠️';
                case 'success': return '✅';
                case 'info': return 'ℹ️';
                default: return '🔔';
            }
        };

        return (
            <TouchableOpacity
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                onPress={() => {
                    // Mark as read on tap
                    setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
                }}
            >
                <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
                    <Text style={styles.iconEm}>{getIconMsg()}</Text>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>{item.title}</Text>
                        <Text style={styles.cardTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <TouchableOpacity style={styles.readAllBtn} onPress={markAllAsRead}>
                    <Text style={styles.readAllBtnText}>Read All</Text>
                </TouchableOpacity>
            </View>

            {notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderNotification}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>📭</Text>
                    <Text style={styles.emptyStateText}>You're all caught up!</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backButton: { width: 70 },
    backButtonText: { fontSize: 16, color: theme.colors.primary },
    title: { fontSize: 20, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    readAllBtn: { width: 70, alignItems: 'flex-end' },
    readAllBtnText: { fontSize: 14, fontWeight: theme.fontWeight.medium, color: theme.colors.primary },

    listContent: { padding: theme.spacing.md },
    notificationCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
    unreadCard: { backgroundColor: '#F8FAFC', borderColor: theme.colors.primaryLight },

    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    iconEm: { fontSize: 18 },

    cardContent: { flex: 1, justifyContent: 'center' },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 15, fontWeight: theme.fontWeight.medium, color: theme.colors.text.primary },
    unreadText: { fontWeight: theme.fontWeight.bold },
    cardTime: { fontSize: 12, color: theme.colors.text.disabled },
    cardDesc: { fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20 },

    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, alignSelf: 'center', marginLeft: theme.spacing.sm },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    emptyStateIcon: { fontSize: 48, opacity: 0.5, marginBottom: theme.spacing.md },
    emptyStateText: { fontSize: 16, color: theme.colors.text.secondary }
});
