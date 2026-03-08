import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../../config/theme';

const { width } = Dimensions.get('window');

export function CommunityScreen() {
    const [activeTab, setActiveTab] = useState<'announcements' | 'polls' | 'amenities' | 'forum'>('announcements');
    const [votedGarbage, setVotedGarbage] = useState(false);

    const tabs = [
        { id: 'announcements', label: 'Announcements' },
        { id: 'polls', label: 'Polls' },
        { id: 'amenities', label: 'Amenities' },
        { id: 'forum', label: 'Forum' }
    ] as const;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Community</Text>
            </View>

            {/* Pill Tabs */}
            <View style={styles.tabWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.pill, activeTab === tab.id && styles.pillActive]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[styles.pillText, activeTab === tab.id && styles.pillTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ANNOUNCEMENTS */}
                {activeTab === 'announcements' && (
                    <View style={styles.section}>
                        <View style={styles.announcementCard}>
                            <View style={styles.dateBlock}>
                                <Text style={styles.dateDay}>12</Text>
                                <Text style={styles.dateMonth}>MAR</Text>
                            </View>
                            <View style={styles.announcementContent}>
                                <View style={styles.announcementHeader}>
                                    <Text style={styles.announcementTitle} numberOfLines={1}>Water Supply Interruption</Text>
                                    <View style={styles.urgentBadge}><Text style={styles.urgentText}>URGENT</Text></View>
                                </View>
                                <Text style={styles.announcementBody} numberOfLines={2}>
                                    The water supply will be interrupted between 2:00 PM and 4:00 PM today due to emergency maintenance of the main pipeline. Please store necessary water.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.announcementCard}>
                            <View style={styles.dateBlock}>
                                <Text style={styles.dateDay}>10</Text>
                                <Text style={styles.dateMonth}>MAR</Text>
                            </View>
                            <View style={styles.announcementContent}>
                                <View style={styles.announcementHeader}>
                                    <Text style={styles.announcementTitle} numberOfLines={1}>Upcoming Society Meet</Text>
                                    <View style={styles.eventBadge}><Text style={styles.eventText}>EVENT</Text></View>
                                </View>
                                <Text style={styles.announcementBody} numberOfLines={2}>
                                    The monthly general body meeting will be held this Sunday at the clubhouse. All members are requested to attend.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* POLLS */}
                {activeTab === 'polls' && (
                    <View style={styles.section}>
                        <View style={styles.pollCard}>
                            <Text style={styles.pollQuestion}>Should we upgrade the gym equipment this quarter?</Text>
                            <Text style={styles.pollMeta}>Ends in 3 days • 145 votes • You voted</Text>

                            <View style={styles.pollOptionContainer}>
                                <View style={[styles.pollFill, { width: '68%', backgroundColor: theme.colors.primaryLight }]} />
                                <View style={styles.pollOptionRow}>
                                    <View style={styles.pollOptionLeft}>
                                        <Text style={styles.checkIcon}>✅</Text>
                                        <Text style={[styles.pollOptionText, { fontWeight: theme.fontWeight.bold, color: theme.colors.primary }]}>Yes, definitely</Text>
                                    </View>
                                    <Text style={[styles.pollPercent, { color: theme.colors.primary }]}>68%</Text>
                                </View>
                            </View>

                            <View style={styles.pollOptionContainer}>
                                <View style={[styles.pollFill, { width: '32%', backgroundColor: '#F3F4F6' }]} />
                                <View style={styles.pollOptionRow}>
                                    <View style={styles.pollOptionLeft}>
                                        <View style={styles.emptyCircle} />
                                        <Text style={styles.pollOptionText}>No, not needed</Text>
                                    </View>
                                    <Text style={styles.pollPercent}>32%</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.pollCard}>
                            <Text style={styles.pollQuestion}>Preferred time for daily garbage collection?</Text>
                            <Text style={styles.pollMeta}>Ends tomorrow • {votedGarbage ? 90 : 89} votes {votedGarbage && '• You voted'}</Text>

                            {votedGarbage ? (
                                <>
                                    <View style={styles.pollOptionContainer}>
                                        <View style={[styles.pollFill, { width: '85%', backgroundColor: theme.colors.primaryLight }]} />
                                        <View style={styles.pollOptionRow}>
                                            <View style={styles.pollOptionLeft}>
                                                <Text style={styles.checkIcon}>✅</Text>
                                                <Text style={[styles.pollOptionText, { fontWeight: theme.fontWeight.bold, color: theme.colors.primary }]}>Morning (7 AM - 9 AM)</Text>
                                            </View>
                                            <Text style={[styles.pollPercent, { color: theme.colors.primary }]}>85%</Text>
                                        </View>
                                    </View>

                                    <View style={styles.pollOptionContainer}>
                                        <View style={[styles.pollFill, { width: '15%', backgroundColor: '#F3F4F6' }]} />
                                        <View style={styles.pollOptionRow}>
                                            <View style={styles.pollOptionLeft}>
                                                <View style={styles.emptyCircle} />
                                                <Text style={styles.pollOptionText}>Evening (6 PM - 8 PM)</Text>
                                            </View>
                                            <Text style={styles.pollPercent}>15%</Text>
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.pollOptionContainerUnvoted} onPress={() => setVotedGarbage(true)}>
                                        <View style={styles.pollOptionRow}>
                                            <View style={styles.pollOptionLeft}>
                                                <View style={styles.emptyCircle} />
                                                <Text style={styles.pollOptionText}>Morning (7 AM - 9 AM)</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.pollOptionContainerUnvoted} onPress={() => setVotedGarbage(true)}>
                                        <View style={styles.pollOptionRow}>
                                            <View style={styles.pollOptionLeft}>
                                                <View style={styles.emptyCircle} />
                                                <Text style={styles.pollOptionText}>Evening (6 PM - 8 PM)</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* AMENITIES */}
                {activeTab === 'amenities' && (
                    <View style={styles.section}>
                        <View style={styles.amenityGrid}>
                            <TouchableOpacity style={styles.amenityCard}>
                                <View style={styles.amenityHeader}>
                                    <Text style={styles.amenityIcon}>🏊‍♂️</Text>
                                    <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                                </View>
                                <Text style={styles.amenityTitle}>Swimming Pool</Text>
                                <Text style={styles.amenityStatus}>Available</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.amenityCard}>
                                <View style={styles.amenityHeader}>
                                    <Text style={styles.amenityIcon}>🎾</Text>
                                    <View style={[styles.statusDot, { backgroundColor: theme.colors.error }]} />
                                </View>
                                <Text style={styles.amenityTitle}>Tennis Court</Text>
                                <Text style={[styles.amenityStatus, { color: theme.colors.error }]}>Booked</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.amenityCard}>
                                <View style={styles.amenityHeader}>
                                    <Text style={styles.amenityIcon}>🎪</Text>
                                    <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                                </View>
                                <Text style={styles.amenityTitle}>Clubhouse</Text>
                                <Text style={styles.amenityStatus}>Available</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.amenityCard}>
                                <View style={styles.amenityHeader}>
                                    <Text style={styles.amenityIcon}>🏋️‍♂️</Text>
                                    <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                                </View>
                                <Text style={styles.amenityTitle}>Gymnasium</Text>
                                <Text style={[styles.amenityStatus, { color: theme.colors.warning }]}>Maintenance</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* FORUM */}
                {activeTab === 'forum' && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyText}>Discussions coming soon.</Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.sm },
    title: { fontSize: 24, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },

    tabWrapper: { paddingVertical: theme.spacing.sm },
    tabContainer: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm },
    pill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    pillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    pillText: { fontSize: 13, fontWeight: theme.fontWeight.medium, color: theme.colors.text.secondary },
    pillTextActive: { color: theme.colors.surface, fontWeight: theme.fontWeight.bold },

    scrollContent: { padding: theme.spacing.lg, paddingBottom: 100 },
    section: { flex: 1 },

    // Announcements
    announcementCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
    dateBlock: { width: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, paddingVertical: 8, marginRight: theme.spacing.md },
    dateDay: { fontSize: 18, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary },
    dateMonth: { fontSize: 11, fontWeight: theme.fontWeight.bold, color: theme.colors.text.secondary },
    announcementContent: { flex: 1, justifyContent: 'center' },
    announcementHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    announcementTitle: { fontSize: 15, fontWeight: theme.fontWeight.semibold, color: theme.colors.text.primary, flex: 1, marginRight: 8 },
    urgentBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FECACA' },
    urgentText: { fontSize: 9, fontWeight: theme.fontWeight.bold, color: theme.colors.error },
    eventBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#BFDBFE' },
    eventText: { fontSize: 9, fontWeight: theme.fontWeight.bold, color: '#2563EB' },
    announcementBody: { fontSize: 13, color: theme.colors.text.secondary, lineHeight: 18 },

    // Polls
    pollCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
    pollQuestion: { fontSize: 16, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 8, lineHeight: 22 },
    pollMeta: { fontSize: 12, color: theme.colors.text.disabled, marginBottom: theme.spacing.lg },

    pollOptionContainer: { position: 'relative', height: 48, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: theme.spacing.sm, overflow: 'hidden', borderWidth: 1, borderColor: 'transparent' },
    pollFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
    pollOptionRow: { position: 'absolute', width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md },
    pollOptionLeft: { flexDirection: 'row', alignItems: 'center' },
    checkIcon: { fontSize: 14, marginRight: 8 },
    emptyCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: theme.colors.text.disabled, marginRight: 8 },
    pollOptionText: { fontSize: 14, color: theme.colors.text.primary, fontWeight: theme.fontWeight.medium },
    pollPercent: { fontSize: 14, fontWeight: theme.fontWeight.bold, color: theme.colors.text.secondary },

    pollOptionContainerUnvoted: { height: 48, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center' },

    // Amenities
    amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: theme.spacing.sm },
    amenityCard: { width: (width - 24 - theme.spacing.lg * 2) / 2, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 4 },
    amenityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
    amenityIcon: { fontSize: 32 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
    amenityTitle: { fontSize: 15, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary, marginBottom: 4 },
    amenityStatus: { fontSize: 12, fontWeight: theme.fontWeight.medium, color: theme.colors.text.secondary },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 40, marginBottom: theme.spacing.md },
    emptyText: { color: theme.colors.text.secondary, fontSize: theme.fontSize.md },
});

export default CommunityScreen;
