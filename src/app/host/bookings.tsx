import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useHostBookings } from '@/features/host/hooks/useHostListings';
import Spinner from '@/shared/components/Spinner';
import type { ApiBooking } from '@/services/api';

const TABS = ['All', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: '#e6f4ea', text: '#1e7e34' },
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  CANCELLED: { bg: '#fee2e2', text: '#b91c1c' },
};

function BookingCard({ booking }: { booking: ApiBooking }) {
  const sc = STATUS_COLORS[booking.status] ?? { bg: '#f3f4f6', text: '#374151' };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{booking.listing.title}</Text>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{booking.status}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>Guest: {booking.guest.name}</Text>
      <Text style={styles.cardMeta}>
        {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
      </Text>
      <Text style={styles.cardMeta}>{booking.guests} guest{booking.guests > 1 ? 's' : ''} · <Text style={{ fontWeight: '600' }}>${booking.totalPrice}</Text></Text>
    </View>
  );
}

export default function HostBookingsScreen() {
  const { data: bookings, isLoading } = useHostBookings();
  const [activeTab, setActiveTab] = useState<Tab>('All');

  const filtered = (bookings ?? []).filter(
    (b) => activeTab === 'All' || b.status === activeTab,
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Bookings</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((t) => (
          <Pressable key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? <Spinner /> : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  tabsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tab: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.backgroundSecondary },
  tabActive: { backgroundColor: Colors.text },
  tabText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.md, gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, flex: 1, marginRight: Spacing.sm },
  cardMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
