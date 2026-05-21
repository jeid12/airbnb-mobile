import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useMyBookings, useCancelBooking } from '@/features/bookings/hooks/useMyBookings';
import { getListingImages, parseLocation } from '@/services/api';
import Spinner from '@/shared/components/Spinner';
import type { ApiBooking } from '@/services/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatYear(iso: string) {
  return new Date(iso).getFullYear();
}
function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: '#e6f4ea', text: '#1e7e34' },
  PENDING:   { bg: '#fef3c7', text: '#92400e' },
  CANCELLED: { bg: '#fee2e2', text: '#b91c1c' },
};

function TripCard({ booking, onCancel }: { booking: ApiBooking; onCancel: () => void }) {
  const sc = STATUS_COLORS[booking.status] ?? { bg: '#f3f4f6', text: '#374151' };
  const loc = booking.listing ? parseLocation(booking.listing.location) : null;
  const img = getListingImages({ type: 'APARTMENT' })[0];

  return (
    <Pressable
      style={styles.tripCard}
      onPress={() => booking.listingId && router.push(`/listing/${booking.listingId}`)}>
      <Image source={{ uri: img }} style={styles.tripImage} contentFit="cover" />
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle} numberOfLines={2}>
          {booking.listing?.title ?? 'Listing'}
        </Text>
        {loc && <Text style={styles.tripMeta}>{loc.city}{loc.region ? `, ${loc.region}` : ''}</Text>}
        <Text style={styles.tripDates}>
          {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)},{' '}
          {formatYear(booking.checkIn)}
        </Text>
        <Text style={styles.tripPrice}>{formatPrice(booking.totalPrice)} total</Text>

        <View style={styles.tripFooter}>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>{booking.status}</Text>
          </View>
          {booking.status !== 'CANCELLED' && (
            <Pressable
              style={styles.cancelBtn}
              onPress={() =>
                Alert.alert('Cancel booking', 'This action cannot be undone.', [
                  { text: 'Keep', style: 'cancel' },
                  { text: 'Cancel booking', style: 'destructive', onPress: onCancel },
                ])
              }>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  return (
    <View style={styles.authGate}>
      <Ionicons name="airplane-outline" size={48} color={Colors.border} />
      <Text style={styles.authTitle}>Log in to see your trips</Text>
      <Text style={styles.authSub}>
        Your confirmed bookings will appear here once you log in.
      </Text>
      <Pressable style={styles.authBtn} onPress={() => router.push('/login')}>
        <Text style={styles.authBtnText}>Log in</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/register')}>
        <Text style={styles.authLink}>Create account</Text>
      </Pressable>
    </View>
  );
}

// ─── Trips Screen ─────────────────────────────────────────────────────────────
export default function TripsScreen() {
  const { token, user } = useAuth();
  const { data: bookings, isLoading, error, refetch } = useMyBookings();
  const { cancel } = useCancelBooking();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const upcoming  = (bookings ?? []).filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.checkIn) >= new Date(),
  );
  const past = (bookings ?? []).filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.checkIn) < new Date(),
  );
  const cancelled = (bookings ?? []).filter((b) => b.status === 'CANCELLED');

  const shown = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Trips</Text>
        <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
      </View>

      {!token ? (
        <AuthGate />
      ) : isLoading ? (
        <Spinner />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error.message}</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
              <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === 'upcoming' && upcoming.length > 0 ? ` (${upcoming.length})` : ''}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              {shown.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="airplane-outline" size={40} color={Colors.border} />
                  <Text style={styles.emptyTitle}>No {tab} trips</Text>
                  {tab === 'upcoming' && (
                    <>
                      <Text style={styles.emptyText}>Time to plan your next adventure!</Text>
                      <Pressable style={styles.exploreBtn} onPress={() => router.push('/(tabs)/home')}>
                        <Text style={styles.exploreBtnText}>Start exploring</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              ) : (
                shown.map((b) => (
                  <TripCard key={b.id} booking={b} onCancel={() => cancel(b.id)} />
                ))
              )}
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.text },
  retryText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  tabsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tab: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.backgroundSecondary },
  tabActive: { backgroundColor: Colors.text },
  tabText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  tripCard: { flexDirection: 'row', borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  tripImage: { width: 100, height: 130 },
  tripInfo: { flex: 1, padding: Spacing.sm, gap: 3 },
  tripTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  tripMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  tripDates: { fontSize: FontSize.xs, color: Colors.text, fontWeight: '500' },
  tripPrice: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  tripFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  authGate: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  authTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  authSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  authBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.sm },
  authBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  authLink: { fontSize: FontSize.base, color: Colors.text, fontWeight: '600', textDecorationLine: 'underline' },
  emptyBox: { alignItems: 'center', padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  exploreBtn: { marginTop: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.text },
  exploreBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
});
