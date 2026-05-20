import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

function StatCard({ label, value, icon, color = Colors.brand }: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>['name']; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={26} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NavTile({ label, icon, route }: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; route: string }) {
  return (
    <Pressable style={styles.navTile} onPress={() => router.push(route as any)}>
      <Ionicons name={icon} size={28} color={Colors.brand} />
      <Text style={styles.navTileText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { data: listingsRes } = useQuery({
    queryKey: ['admin', 'listings'],
    queryFn: () => api.getListings({ limit: 1 }, token),
    enabled: !!token,
  });
  const { data: bookingsRes } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => api.getBookings(token!),
    enabled: !!token,
  });

  const totalListings = listingsRes?.meta.total ?? 0;
  const totalBookings = bookingsRes?.meta.total ?? 0;
  const totalRevenue = (bookingsRes?.data ?? []).reduce((s, b) => s + b.totalPrice, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.name}>{user?.name ?? 'Administrator'}</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Listings" value={String(totalListings)} icon="home-outline" />
          <StatCard label="Bookings" value={String(totalBookings)} icon="calendar-outline" color="#3b82f6" />
          <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="cash-outline" color="#10b981" />
          <StatCard label="Platform" value="Live" icon="checkmark-circle-outline" color="#8b5cf6" />
        </View>

        {/* Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.navList}>
            <NavTile label="Moderation Queue" icon="shield-checkmark-outline" route="/admin/moderation" />
            <NavTile label="All Users" icon="people-outline" route="/admin/users" />
            <NavTile label="All Bookings" icon="list-outline" route="/admin/bookings" />
            <NavTile label="View Site" icon="globe-outline" route="/(tabs)/home" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: Spacing.sm },
  statCard: { width: '47%', backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', gap: 4, ...Shadow.sm },
  statValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  section: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  navList: { gap: 0, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, overflow: 'hidden' },
  navTile: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.md },
  navTileText: { flex: 1, fontSize: FontSize.base, fontWeight: '500', color: Colors.text },
});
