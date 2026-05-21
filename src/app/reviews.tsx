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
import { useListingReviews } from '@/features/listings/hooks/useReviews';
import type { ApiReview } from '@/services/api';
import Spinner from '@/shared/components/Spinner';

function ReviewCard({ review }: { review: ApiReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.user.avatar ?? 'https://i.pravatar.cc/100' }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View>
          <Text style={styles.authorName}>{review.user.name}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </View>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons key={i} name={i <= review.rating ? 'star' : 'star-outline'} size={11} color={Colors.text} />
        ))}
      </View>
      <Text style={styles.reviewBody}>{review.comment}</Text>
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
  const [search, setSearch] = useState('');

  const { data, isLoading } = useListingReviews(listingId ?? '', { limit: 50 });

  const reviews = data?.data ?? [];
  const total = data?.meta.total ?? reviews.length;
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const filtered = search.trim()
    ? reviews.filter(
        (r) =>
          r.comment.toLowerCase().includes(search.toLowerCase()) ||
          r.user.name.toLowerCase().includes(search.toLowerCase()),
      )
    : reviews;

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          ★ {avgRating.toFixed(1)} · {total} review{total !== 1 ? 's' : ''}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <Spinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <ReviewCard review={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <RatingBar label="Overall" value={avgRating} />

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
                  {filtered.length} review{filtered.length !== 1 ? 's' : ''} mentioning "{search}"
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {search ? 'No matching reviews' : 'No reviews yet'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  listHeader: { padding: Spacing.md, gap: Spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ratingLabel: { width: 100, fontSize: FontSize.sm, color: Colors.text },
  ratingTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight, overflow: 'hidden' },
  ratingFill: { height: '100%', backgroundColor: Colors.text, borderRadius: 2 },
  ratingValue: { width: 28, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 10, gap: Spacing.sm, ...Shadow.sm },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  resultCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  listContent: { paddingBottom: 48 },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  reviewCard: { padding: Spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.backgroundSecondary },
  authorName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  reviewDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  stars: { flexDirection: 'row', gap: 2, marginBottom: Spacing.sm },
  reviewBody: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
});
