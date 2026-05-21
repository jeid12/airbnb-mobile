import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useHostBookings } from '@/features/host/hooks/useHostListings';
import { api } from '@/services/api';
import Spinner from '@/shared/components/Spinner';
import type { ApiBooking, BookingStatus } from '@/services/api';

const TABS = ['All', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: '#e6f4ea', text: '#1e7e34' },
  PENDING:   { bg: '#fef3c7', text: '#92400e' },
  CANCELLED: { bg: '#fee2e2', text: '#b91c1c' },
};

function BookingCard({ booking }: { booking: ApiBooking }) {
  const sc = STATUS_COLORS[booking.status] ?? { bg: '#f3f4f6', text: '#374151' };
  const qc = useQueryClient();

  const updateStatus = useMutation<ApiBooking, Error, BookingStatus>({
    mutationFn: (status) => api.updateBookingStatus(booking.id, status),
    onMutate: (status) => {
      // Optimistic update
      qc.setQueryData<ApiBooking[]>(['bookings', 'host'], (old) =>
        old?.map((b) => b.id === booking.id ? { ...b, status } : b) ?? [],
      );
    },
    onSuccess: (_, status) => {
      Toast.show({ type: 'success', text1: status === 'CONFIRMED' ? 'Booking approved!' : 'Booking declined' });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'host'] });
      Toast.show({ type: 'error', text1: 'Update failed' });
    },
  });

  function confirm(status: BookingStatus, label: string) {
    Alert.alert(`${label} booking`, `Are you sure you want to ${label.toLowerCase()} this booking?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: label, style: status === 'CANCELLED' ? 'destructive' : 'default', onPress: () => updateStatus.mutate(status) },
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{booking.listing?.title ?? 'Listing'}</Text>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{booking.status}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>Guest: {booking.guest?.name ?? 'Guest'}</Text>
      <Text style={styles.cardMeta}>
        {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
      </Text>
      <Text style={styles.cardMeta}>
        {booking.guests ?? 1} guest{(booking.guests ?? 1) > 1 ? 's' : ''} · <Text style={{ fontWeight: '600' }}>${booking.totalPrice}</Text>
      </Text>

      {/* Approve / Decline actions for pending bookings */}
      {booking.status === 'PENDING' && (
        <View style={styles.actions}>
          <Pressable style={styles.approveBtn} onPress={() => confirm('CONFIRMED', 'Approve')}>
            <Ionicons name="checkmark" size={16} color={Colors.white} />
            <Text style={styles.approveBtnText}>Approve</Text>
          </Pressable>
          <Pressable style={styles.declineBtn} onPress={() => confirm('CANCELLED', 'Decline')}>
            <Ionicons name="close" size={16} color={Colors.white} />
            <Text style={styles.declineBtnText}>Decline</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function HostBookingsScreen() {
  const { data: bookings, isLoading } = useHostBookings();
  const [activeTab, setActiveTab] = useState<Tab>('All');

  const filtered = (bookings ?? []).filter(
    (b) => activeTab === 'All' || b.status === activeTab,
  );

  const pending = (bookings ?? []).filter((b) => b.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Bookings</Text>
        {pending > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pending} pending</Text>
          </View>
        )}
      </View>

      {/* Status tabs */}
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  pendingBadge: { backgroundColor: '#fef3c7', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  pendingBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: '#92400e' },
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
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.success, borderRadius: Radius.lg, paddingVertical: 10 },
  approveBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.sm },
  declineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ef4444', borderRadius: Radius.lg, paddingVertical: 10 },
  declineBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.sm },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
