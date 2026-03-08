import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../store/hooks';
import { logout, setUserMode } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';
import { apiClient } from '../../core/api/client';
import { API_CONFIG } from '../../config/api';

interface DashboardStats {
    totalResidents: number;
    activeParkingSessions: number;
    visitorsToday: number;
    openComplaints: number;
    parkingRevenue: number;
    totalVehicles: number;
    pendingPasses: number;
}

const PARKING_URL = API_CONFIG.PARKING_URL;

function StatCard({ icon, label, value, sub, color, bg }: {
    icon: string; label: string; value: string | number;
    sub?: string; color: string; bg: string;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: bg }]}>
            <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
                <Text style={styles.statIcon}>{icon}</Text>
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
        </View>
    );
}

const ACTIVITY_FEED = [
    { icon: '🚗', text: 'Vehicle TS09EA1234 entered Gate 1', time: '2 mins ago', color: '#10B981' },
    { icon: '👋', text: 'Visitor pass generated for Flat A-201', time: '15 mins ago', color: '#6366F1' },
    { icon: '⚠️', text: 'New helpdesk ticket: Lift maintenance', time: '1 hour ago', color: '#F59E0B' },
    { icon: '💰', text: 'Maintenance fee paid – Flat B-305', time: '2 hours ago', color: '#0EA5E9' },
    { icon: '🚗', text: 'Vehicle TS07AB5678 exited Gate 2', time: '3 hours ago', color: '#EF4444' },
];

export function DashboardScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    const [stats, setStats] = useState<DashboardStats>({
        totalResidents: 0,
        activeParkingSessions: 0,
        visitorsToday: 0,
        openComplaints: 0,
        parkingRevenue: 0,
        totalVehicles: 0,
        pendingPasses: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const [vehicleRes, visitorRes, usersRes, parkingRes] = await Promise.allSettled([
                apiClient.get(PARKING_URL + '/api/vehicles/stats'),
                apiClient.get('/visitors/passes/stats'),
                apiClient.get('/users/stats'),
                apiClient.get(PARKING_URL + '/api/parking/stats'),
            ]);

            const vStats = vehicleRes.status === 'fulfilled' ? vehicleRes.value.data : null;
            const pStats = visitorRes.status === 'fulfilled' ? visitorRes.value.data : null;
            const uStats = usersRes.status === 'fulfilled' ? usersRes.value.data : null;
            const psStats = parkingRes.status === 'fulfilled' ? parkingRes.value.data : null;

            setStats(prev => ({
                ...prev,
                totalVehicles: vStats?.total_vehicles ?? prev.totalVehicles,
                visitorsToday: pStats?.todayCount ?? prev.visitorsToday,
                pendingPasses: pStats?.pending ?? prev.pendingPasses,
                totalResidents: uStats?.totalUsers ?? prev.totalResidents,
                activeParkingSessions: psStats?.active_sessions ?? prev.activeParkingSessions,
                parkingRevenue: psStats?.total_revenue ?? prev.parkingRevenue,
            }));
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch {
            // silent fail — keep previous values
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const onRefresh = () => { setRefreshing(true); fetchStats(); };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Admin Overview</Text>
                    <Text style={styles.subtitle}>
                        {lastUpdated ? 'Updated ' + lastUpdated : 'Loading live data...'}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => dispatch(setUserMode())} style={styles.switchBtn}>
                        <Text style={styles.switchBtnText}>User View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => dispatch(logout())} style={styles.logoutBtn}>
                        <Text style={styles.logoutBtnText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Fetching live stats...</Text>
                    </View>
                ) : (
                    <>
                        {/* Live Parking Hero */}
                        <View style={styles.heroCard}>
                            <View style={styles.heroTop}>
                                <View style={styles.liveDot} />
                                <Text style={styles.heroLabel}>Live Parking Status</Text>
                            </View>
                            <View style={styles.heroStats}>
                                <View style={styles.heroStat}>
                                    <Text style={styles.heroVal}>{stats.activeParkingSessions}</Text>
                                    <Text style={styles.heroStatLabel}>Active</Text>
                                </View>
                                <View style={styles.heroDivider} />
                                <View style={styles.heroStat}>
                                    <Text style={styles.heroVal}>{stats.totalVehicles}</Text>
                                    <Text style={styles.heroStatLabel}>Vehicles</Text>
                                </View>
                                <View style={styles.heroDivider} />
                                <View style={styles.heroStat}>
                                    <Text style={styles.heroVal}>{'Rs.' + stats.parkingRevenue}</Text>
                                    <Text style={styles.heroStatLabel}>Revenue</Text>
                                </View>
                            </View>
                        </View>

                        {/* Stats Grid */}
                        <Text style={styles.sectionTitle}>Society Overview</Text>
                        <View style={styles.statsGrid}>
                            <StatCard icon="🏠" label="Residents" value={stats.totalResidents || '—'} sub="Registered" color="#6366F1" bg="#EEF2FF" />
                            <StatCard icon="🚗" label="Vehicles" value={stats.totalVehicles} sub="Registered" color="#0EA5E9" bg="#F0F9FF" />
                            <StatCard icon="👥" label="Visitors Today" value={stats.visitorsToday} sub="Passes generated" color="#10B981" bg="#ECFDF5" />
                            <StatCard icon="⚠️" label="Open Tickets" value={stats.openComplaints || '—'} sub="Pending resolve" color="#F59E0B" bg="#FFFBEB" />
                            <StatCard icon="📋" label="Pending Passes" value={stats.pendingPasses || '—'} sub="Awaiting scan" color="#8B5CF6" bg="#F5F3FF" />
                            <StatCard icon="💵" label="Parking Rev." value={'Rs.' + stats.parkingRevenue} sub="Total collected" color="#EF4444" bg="#FFF1F2" />
                        </View>

                        {/* Quick Actions */}
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionsRow}>
                            {[
                                { icon: '📢', label: 'Announce', screen: 'AdminAnnounce', color: '#6366F1', bg: '#EEF2FF' },
                                { icon: '🧾', label: 'Invoice', screen: 'AdminInvoice', color: '#10B981', bg: '#ECFDF5' },
                                { icon: '🛡️', label: 'Guards', screen: 'AdminGuards', color: '#F59E0B', bg: '#FFFBEB' },
                                { icon: '⚙️', label: 'Settings', screen: 'AdminSettings', color: '#64748B', bg: '#F8FAFC' },
                            ].map((a) => (
                                <TouchableOpacity
                                    key={a.screen}
                                    style={[styles.actionCard, { backgroundColor: a.bg }]}
                                    onPress={() => navigation.navigate(a.screen)}
                                >
                                    <View style={[styles.actionIconWrap, { backgroundColor: a.color + '22' }]}>
                                        <Text style={styles.actionIcon}>{a.icon}</Text>
                                    </View>
                                    <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Timeline */}
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <View style={styles.timeline}>
                            {ACTIVITY_FEED.map((item, i) => (
                                <View key={i} style={styles.timelineRow}>
                                    <View style={styles.timelineLeft}>
                                        <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                                        {i < ACTIVITY_FEED.length - 1 && <View style={styles.timelineLine} />}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.timelineText}>{item.icon} {item.text}</Text>
                                        <Text style={styles.timelineTime}>{item.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
    },
    title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
    subtitle: { fontSize: 12, color: '#888', marginTop: 2 },
    headerActions: { flexDirection: 'row', gap: 8 },
    switchBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EEF2FF', borderRadius: 10 },
    switchBtnText: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
    logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF1F2', borderRadius: 10 },
    logoutBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
    scroll: { padding: 16, paddingBottom: 80 },
    loadingBox: { alignItems: 'center', paddingVertical: 60 },
    loadingText: { color: '#888', marginTop: 12, fontSize: 14 },

    // Hero
    heroCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, marginBottom: 24 },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
    heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    heroStats: { flexDirection: 'row', alignItems: 'center' },
    heroStat: { flex: 1, alignItems: 'center' },
    heroVal: { fontSize: 26, fontWeight: '800', color: '#fff' },
    heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    heroDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },

    // Stats Grid
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', marginBottom: 12, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    statCard: {
        width: '47.5%', borderRadius: 16, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    statIconWrap: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statIcon: { fontSize: 20 },
    statLabel: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '600' },
    statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
    statSub: { fontSize: 11, color: '#AAA' },

    // Actions
    actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    actionCard: {
        flex: 1, borderRadius: 14, padding: 12, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    actionIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    actionIcon: { fontSize: 22 },
    actionLabel: { fontSize: 11, fontWeight: '700' },

    // Timeline
    timeline: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    timelineRow: { flexDirection: 'row', marginBottom: 12 },
    timelineLeft: { width: 20, alignItems: 'center', marginRight: 12 },
    timelineDot: { width: 10, height: 10, borderRadius: 5 },
    timelineLine: { flex: 1, width: 1.5, backgroundColor: '#F0F0F0', marginTop: 3 },
    timelineContent: { flex: 1, paddingBottom: 4 },
    timelineText: { fontSize: 13, color: '#333', fontWeight: '500', lineHeight: 18 },
    timelineTime: { fontSize: 11, color: '#AAA', marginTop: 3 },
});

export default DashboardScreen;
