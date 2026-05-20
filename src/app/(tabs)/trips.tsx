import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { trips } from '@/data/trips';
import { listings } from '@/data/listings';
import type { Trip } from '@/features/listings/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYear(iso: string) {
  return new Date(iso).getFullYear();
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Pressable
      style={styles.tripCard}
      onPress={() => router.push(`/listing/${trip.listing.id}`)}>
      <Image
        source={{ uri: trip.listing.image }}
        style={styles.tripImage}
        contentFit="cover"
      />
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle} numberOfLines={2}>
          {trip.listing.title}
        </Text>
        <Text style={styles.tripMeta}>
          {trip.listing.city}, {trip.listing.country}
        </Text>
        <Text style={styles.tripDates}>
          {formatDate(trip.checkIn)} – {formatDate(trip.checkOut)},{' '}
          {formatYear(trip.checkIn)}
        </Text>
        <Text style={styles.tripHost}>Hosted by {trip.host.name}</Text>
      </View>
    </Pressable>
  );
}

function ExploreCard({
  img,
  name,
  count,
}: {
  img: string;
  name: string;
  count: string;
}) {
  return (
    <Pressable style={styles.exploreCard}>
      <Image source={{ uri: img }} style={styles.exploreImage} contentFit="cover" />
      <View style={styles.exploreOverlay}>
        <Text style={styles.exploreName}>{name}</Text>
        <Text style={styles.exploreCount}>{count}</Text>
      </View>
    </Pressable>
  );
}

export default function TripsScreen() {
  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const nearbyCity = upcomingTrips[0]?.listing.city ?? 'Yonkers';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trips</Text>
          <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
        </View>

        {/* Upcoming reservations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming reservations</Text>
          {upcomingTrips.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="airplane-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyTitle}>No upcoming trips</Text>
              <Text style={styles.emptyText}>
                Time to plan your next adventure. Start exploring destinations.
              </Text>
              <Pressable
                style={styles.exploreBtn}
                onPress={() => router.push('/home')}>
                <Text style={styles.exploreBtnText}>Start exploring</Text>
              </Pressable>
            </View>
          ) : (
            upcomingTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </View>

        {/* Explore things to do nearby */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Explore things to do near {nearbyCity}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreScroll}>
            <ExploreCard
              img={listings[0].images[0]}
              name="Stays"
              count={`${listings.length} places`}
            />
            <ExploreCard
              img={listings[2].images[0]}
              name="Experiences"
              count="12 available"
            />
            <ExploreCard
              img={listings[3].images[0]}
              name="Adventures"
              count="5 nearby"
            />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },

  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Trip card
  tripCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  tripImage: { width: 100, height: 110 },
  tripInfo: { flex: 1, padding: Spacing.md, gap: 3 },
  tripTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  tripMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tripDates: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  tripHost: { fontSize: FontSize.sm, color: Colors.textSecondary },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  exploreBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.text,
  },
  exploreBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  // Explore nearby
  exploreScroll: { gap: Spacing.md, paddingRight: Spacing.md },
  exploreCard: {
    width: 140,
    height: 120,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.sm,
  },
  exploreImage: { width: '100%', height: '100%' },
  exploreOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  exploreName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
  exploreCount: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)' },
});
