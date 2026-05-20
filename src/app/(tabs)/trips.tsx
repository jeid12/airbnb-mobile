import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { api, getListingImages, parseLocation, type ApiBooking } from '@/services/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYear(iso: string) {
  return new Date(iso).getFullYear();
}

function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#008A05',
  PENDING: '#E67700',
  CANCELLED: '#717171',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] + '20' }]}>
      <Text style={[styles.badgeText, { color: STATUS_COLORS[status] ?? Colors.textSecondary }]}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Text>
    </View>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────
function TripCard({ booking }: { booking: ApiBooking }) {
  const loc = parseLocation(booking.listing.location);
  const images = getListingImages({ type: 'APARTMENT' }); // fallback image

  return (
    <Pressable
      style={styles.tripCard}
      onPress={() => router.push(`/listing/${booking.listingId}`)}>
      <Image source={{ uri: images[0] }} style={styles.tripImage} contentFit="cover" />
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle} numberOfLines={2}>
          {booking.listing.title}
        </Text>
        <Text style={styles.tripMeta}>{loc.city}{loc.region ? `, ${loc.region}` : ''}</Text>
        <Text style={styles.tripDates}>
          {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)},{' '}
          {formatYear(booking.checkIn)}
        </Text>
        <View style={styles.tripBottom}>
          <Text style={styles.tripPrice}>{formatPrice(booking.totalPrice)} total</Text>
          <StatusBadge status={booking.status} />
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
        Once you log in or create an account, your confirmed bookings will appear here.
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
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getBookings(token!);
        if (!cancelled) {
          // Filter to only this user's bookings
          const mine = res.data.filter((b) => b.guestId === user?.id);
          setBookings(mine);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to load trips');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [token, user?.id]);

  const upcoming = bookings.filter((b) => b.status !== 'CANCELLED' && new Date(b.checkIn) >= new Date());
  const past = bookings.filter((b) => b.status !== 'CANCELLED' && new Date(b.checkIn) < new Date());
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Trips</Text>
        <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
      </View>

      {!token ? (
        <AuthGate />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Upcoming */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming reservations</Text>
            {upcoming.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="airplane-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyTitle}>No upcoming trips</Text>
                <Text style={styles.emptyText}>
                  Time to plan your next adventure. Start exploring destinations.
                </Text>
                <Pressable style={styles.exploreBtn} onPress={() => router.push('/(tabs)/home')}>
                  <Text style={styles.exploreBtnText}>Start exploring</Text>
                </Pressable>
              </View>
            ) : (
              upcoming.map((b) => <TripCard key={b.id} booking={b} />)
            )}
          </View>

          {/* Past */}
          {past.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Past trips</Text>
              {past.map((b) => <TripCard key={b.id} booking={b} />)}
            </View>
          )}

          {/* Cancelled */}
          {cancelled.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cancelled</Text>
              {cancelled.map((b) => <TripCard key={b.id} booking={b} />)}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },

  // Auth gate
  authGate: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  authTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  authSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  authBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.sm,
  },
  authBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  authLink: {
    fontSize: FontSize.base, color: Colors.text,
    fontWeight: '600', textDecorationLine: 'underline',
  },

  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },

  // Trip card
  tripCard: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: Radius.xl, overflow: 'hidden',
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  tripImage: { width: 100, height: 120 },
  tripInfo: { flex: 1, padding: Spacing.md, gap: 3 },
  tripTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  tripMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tripDates: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  tripBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  tripPrice: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },

  // Empty state
  emptyBox: {
    alignItems: 'center', padding: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  exploreBtn: {
    marginTop: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.text,
  },
  exploreBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
});
