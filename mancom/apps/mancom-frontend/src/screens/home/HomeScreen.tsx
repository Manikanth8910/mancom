import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';
import { useNavigation } from '@react-navigation/native';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAppSelector(selectUser);

  const displayName = user?.name || 'Resident';

  const navigateTo = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Good Morning 👋</Text>
            <Text style={styles.nameText}>{displayName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationBell} onPress={() => navigateTo('Notifications')}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarCircle} onPress={() => navigateTo('EditProfile')}>
              <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Outstanding Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceLeft}>
            <Text style={styles.balanceLabel}>Outstanding Balance</Text>
            <Text style={styles.balanceAmount}>₹0</Text>
            <Text style={styles.balanceDue}>No dues</Text>
          </View>
          <TouchableOpacity
            style={styles.payNowPill}
            onPress={() => navigateTo('Payments')}
          >
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('Visitors')}>
            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FF' }]}>
              <Text style={styles.gridIcon}>👋</Text>
            </View>
            <Text style={styles.gridText}>Visitors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('Payments')}>
            <View style={[styles.iconCircle, { backgroundColor: '#E6F9F4' }]}>
              <Text style={styles.gridIcon}>💳</Text>
            </View>
            <Text style={styles.gridText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('Helpdesk')}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF7E6' }]}>
              <Text style={styles.gridIcon}>🔧</Text>
            </View>
            <Text style={styles.gridText}>Helpdesk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('Community')}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFEDED' }]}>
              <Text style={styles.gridIcon}>📢</Text>
            </View>
            <Text style={styles.gridText}>Community</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('Vehicles')}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F7FA' }]}>
              <Text style={styles.gridIcon}>🚗</Text>
            </View>
            <Text style={styles.gridText}>Vehicles</Text>
          </TouchableOpacity>

          {/* SOS Full width / Larger Tile */}
          <TouchableOpacity style={[styles.gridItem, styles.sosItem]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFEBEB' }]}>
              <Text style={styles.gridIcon}>🛡️</Text>
            </View>
            <Text style={[styles.gridText, styles.sosText]}>SOS Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        <View style={[styles.activityFeed, styles.emptyActivityFeed]}>
          <Text style={styles.emptyActivityText}>No recent activity right now.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  greetingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 22,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  notificationBell: {
    position: 'relative',
    padding: theme.spacing.xs,
  },
  bellIcon: {
    fontSize: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.error,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  balanceDue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  payNowPill: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  payNowText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxl,
    rowGap: theme.spacing.md,
  },
  gridItem: {
    width: '31%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  sosItem: {
    borderColor: '#FFEBEB',
    borderWidth: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  gridIcon: {
    fontSize: 24,
  },
  gridText: {
    fontSize: 13,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  sosText: {
    color: theme.colors.error,
    fontWeight: theme.fontWeight.bold,
  },
  activityFeed: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  activityBorder: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  activityDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
    marginLeft: 20, // offset past the border
  },
  emptyActivityFeed: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActivityText: {
    color: theme.colors.text.disabled,
    fontSize: theme.fontSize.sm,
  },
});

export default HomeScreen;
