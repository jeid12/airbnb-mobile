import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { api } from '@/services/api';
import Spinner from '@/shared/components/Spinner';
import type { ApiBooking } from '@/services/api';

const STATUS_TABS = ['All', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const;
type StatusTab = typeof STATUS_TABS[number];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: '#e6f4ea', text: '#1e7e34' },
  PENDING:   { bg: '#fef3c7', text: '#92400e' },
  CANCELLED: { bg: '#fee2e2', text: '#b91c1c' },
};

function BookingRow({ booking }: { booking: ApiBooking }) {
  const sc = STATUS_COLORS[booking.status] ?? { bg: '#f3f4f6', text: '#374151' };
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>{booking.listing.title}</Text>
        <Text style={styles.rowMeta}>Guest: {booking.guest.name}</Text>
        <Text style={styles.rowMeta}>
          {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
        </Text>
        <Text style={styles.rowMeta}>${booking.totalPrice} · {booking.guests} guest{booking.guests > 1 ? 's' : ''}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: sc.bg }]}>
        <Text style={[styles.badgeText, { color: sc.text }]}>{booking.status}</Text>
      </View>
    </View>
  );
}

export default function AdminBookingsScreen() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [search, setSearch] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['bookings', 'all', activeTab],
    queryFn: () => api.getBookings(token!),
    enabled: !!token,
    placeholderData: (prev) => prev,
  });

  const allBookings = res?.data ?? [];
  const filtered = allBookings.filter((b) => {
    const matchTab = activeTab === 'All' || b.status === activeTab;
    const matchSearch = !search ||
      b.listing.title.toLowerCase().includes(search.toLowerCase()) ||
      b.guest.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>All Bookings</Text>
        <Text style={styles.count}>{filtered.length}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guest or listing…"
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Status filter */}
      <View style={styles.tabsRow}>
        {STATUS_TABS.map((t) => (
          <Pressable key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? <Spinner /> : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <BookingRow booking={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No bookings found.</Text></View>}
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
  count: { fontSize: FontSize.sm, color: Colors.textSecondary },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, margin: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  tabsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm },
  tab: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.backgroundSecondary },
  tabActive: { backgroundColor: Colors.text },
  tabText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  separator: { height: 1, backgroundColor: Colors.borderLight },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  rowTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  rowMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start' },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
