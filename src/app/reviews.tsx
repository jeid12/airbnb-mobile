import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { api, type ApiReview } from '@/services/api';

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

export default function ReviewsModal() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!listingId) return;
    Promise.all([
      api.getListingReviews(listingId, { limit: 50 }),
      api.getListing(listingId),
    ])
      .then(([revRes, detail]) => {
        setReviews(revRes.data);
        setRating(detail.rating);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId]);

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
          ★ {rating.toFixed(1)} · {reviews.length} reviews
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <ReviewCard review={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
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
                  {filtered.length} review{filtered.length !== 1 ? 's' : ''} mentioned "{search}"
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {search ? 'No search results' : 'No reviews yet'}
              </Text>
              {search ? (
                <Text style={styles.emptyText}>Reviews mentioning "{search}" will appear here.</Text>
              ) : null}
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
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginTop: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listHeader: { padding: Spacing.md, gap: Spacing.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 10, gap: Spacing.sm, ...Shadow.sm,
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
  stars: { flexDirection: 'row', gap: 2, marginBottom: Spacing.sm },
  reviewBody: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  empty: { padding: Spacing.xl, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
