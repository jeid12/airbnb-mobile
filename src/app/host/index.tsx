import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useMyListings, useHostBookings } from '@/features/host/hooks/useHostListings';
import Spinner from '@/shared/components/Spinner';

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={Colors.brand} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HostDashboard() {
  const { user } = useAuth();
  const { data: listings, isLoading: listLoading } = useMyListings();
  const { data: bookings, isLoading: bookLoading } = useHostBookings();

  const totalListings = listings?.length ?? 0;
  const confirmedBookings = bookings?.filter((b) => b.status === 'CONFIRMED') ?? [];
  const totalEarnings = confirmedBookings.reduce((s, b) => s + b.totalPrice, 0);
  const recentBookings = bookings?.slice(0, 5) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name ?? 'Host'}</Text>
        </View>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
      </View>

      {(listLoading || bookLoading) ? <Spinner /> : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard label="Listings" value={String(totalListings)} icon="home-outline" />
            <StatCard label="Bookings" value={String(confirmedBookings.length)} icon="calendar-outline" />
            <StatCard label="Earned" value={`$${totalEarnings.toLocaleString()}`} icon="cash-outline" />
          </View>

          {/* Quick actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <View style={styles.actionsRow}>
              <Pressable style={styles.actionBtn} onPress={() => router.push('/host/create' as any)}>
                <Ionicons name="add-circle-outline" size={22} color={Colors.brand} />
                <Text style={styles.actionText}>Add listing</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => router.push('/host/listings' as any)}>
                <Ionicons name="list-outline" size={22} color={Colors.brand} />
                <Text style={styles.actionText}>My listings</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => router.push('/host/bookings' as any)}>
                <Ionicons name="people-outline" size={22} color={Colors.brand} />
                <Text style={styles.actionText}>Bookings</Text>
              </Pressable>
            </View>
          </View>

          {/* Recent bookings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent bookings</Text>
            {recentBookings.length === 0 ? (
              <Text style={styles.emptyText}>No bookings yet.</Text>
            ) : (
              recentBookings.map((b) => (
                <View key={b.id} style={styles.bookingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTitle} numberOfLines={1}>{b.listing.title}</Text>
                    <Text style={styles.bookingMeta}>{b.guest.name} · {new Date(b.checkIn).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: b.status === 'CONFIRMED' ? '#e6f4ea' : '#fef3c7' }]}>
                    <Text style={[styles.badgeText, { color: b.status === 'CONFIRMED' ? '#1e7e34' : '#92400e' }]}>
                      {b.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', gap: 4, ...Shadow.sm },
  statValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', gap: 6 },
  actionText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.text },
  bookingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  bookingTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.text },
  bookingMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
