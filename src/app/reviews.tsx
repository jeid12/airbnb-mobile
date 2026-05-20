import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { listings } from '@/data/listings';
import type { Review } from '@/features/listings/types';

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.author.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View>
          <Text style={styles.authorName}>{review.author.name}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewBody}>{review.body}</Text>
    </View>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingTrack}>
        <View style={[styles.ratingFill, { width: `${(value / 5) * 100}%` }]} />
      </View>
      <Text style={styles.ratingValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

export default function ReviewsModal() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const listing = listings.find((l) => l.id === listingId);
  const [search, setSearch] = useState('');

  if (!listing) return null;

  const filtered = search.trim()
    ? listing.reviews.filter((r) =>
        r.body.toLowerCase().includes(search.toLowerCase()) ||
        r.author.name.toLowerCase().includes(search.toLowerCase())
      )
    : listing.reviews;

  return (
    <View style={styles.container}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          <Ionicons name="star" size={14} /> {listing.rating.overall.toFixed(2)} ·{' '}
          {listing.rating.count} reviews
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <ReviewCard review={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Rating breakdown */}
            <RatingBar label="Cleanliness" value={listing.rating.cleanliness} />
            <RatingBar label="Accuracy" value={listing.rating.accuracy} />
            <RatingBar label="Communication" value={listing.rating.communication} />
            <RatingBar label="Location" value={listing.rating.location} />
            <RatingBar label="Check-in" value={listing.rating.checkIn} />
            <RatingBar label="Value" value={listing.rating.value} />

            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search reviews"
                placeholderTextColor={Colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {search.length > 0 && (
              <Text style={styles.resultCount}>
                {filtered.length} review{filtered.length !== 1 ? 's' : ''} mentioned "
                {search}"
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No search results</Text>
            <Text style={styles.emptyText}>
              Reviews mentioning "{search}" will appear here. Reviews written in another language
              will not appear in this search.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  listHeader: { padding: Spacing.md, gap: Spacing.sm },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ratingLabel: { width: 100, fontSize: FontSize.sm, color: Colors.text },
  ratingTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight, overflow: 'hidden' },
  ratingFill: { height: '100%', backgroundColor: Colors.text, borderRadius: 2 },
  ratingValue: { width: 28, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  resultCount: { fontSize: FontSize.sm, color: Colors.textSecondary },

  listContent: { paddingBottom: 48 },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },

  reviewCard: { padding: Spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.backgroundSecondary },
  authorName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  reviewDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reviewBody: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  empty: { padding: Spacing.xl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
