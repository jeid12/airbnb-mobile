import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { categories } from '@/data/categories';
import { api, categoryToApiType, getListingImages, parseLocation, type ApiListingItem } from '@/services/api';
import type { ListingCategory } from '@/features/listings/types';

const { width: SCREEN_W } = Dimensions.get('window');
const PAGE_SIZE = 20;

function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
}

// ─── Search Pill ──────────────────────────────────────────────────────────────
function SearchPill() {
  return (
    <Pressable
      style={styles.searchPill}
      onPress={() => router.push('/search')}
      android_ripple={{ color: Colors.border }}>
      <Ionicons name="search" size={18} color={Colors.text} />
      <View style={styles.searchPillText}>
        <Text style={styles.searchPillTitle}>Where to?</Text>
        <Text style={styles.searchPillSub}>Anywhere · Any week · Add guests</Text>
      </View>
      <View style={styles.filterBtn}>
        <Ionicons name="options-outline" size={16} color={Colors.text} />
      </View>
    </Pressable>
  );
}

// ─── Category Filter ──────────────────────────────────────────────────────────
function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: ListingCategory | null;
  onSelect: (id: ListingCategory | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScroll}>
      {categories.map((cat) => {
        const active = selected === cat.id;
        return (
          <Pressable
            key={cat.id}
            style={styles.categoryItem}
            onPress={() => onSelect(active ? null : cat.id)}>
            <Ionicons
              name={cat.icon as any}
              size={22}
              color={active ? Colors.text : Colors.textSecondary}
            />
            <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
              {cat.label}
            </Text>
            {active && <View style={styles.categoryUnderline} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({
  listing,
  saved,
  onToggleSave,
}: {
  listing: ApiListingItem;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = getListingImages(listing);
  const loc = parseLocation(listing.location);

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/listing/${listing.id}`)}>
      {/* Photo carousel */}
      <View style={styles.cardImageWrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - Spacing.md * 2));
            setImageIndex(idx);
          }}>
          {images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.cardImage} contentFit="cover" />
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.dotRow}>
            {images.map((_, i) => (
              <View key={i} style={[styles.imgDot, i === imageIndex && styles.imgDotActive]} />
            ))}
          </View>
        )}

        <Pressable
          style={styles.heartBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleSave(listing.id);
          }}
          hitSlop={8}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={22}
            color={saved ? Colors.brand : Colors.white}
            style={styles.heartIcon}
          />
        </Pressable>
      </View>

      {/* Details */}
      <View style={styles.cardDetails}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLocation} numberOfLines={1}>
            {loc.city}{loc.region ? `, ${loc.region}` : ''}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.text} />
            <Text style={styles.ratingText}>{listing.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.cardType} numberOfLines={1}>
          {listing.type.charAt(0) + listing.type.slice(1).toLowerCase()} · {listing.guests} guests
        </Text>
        <Text style={styles.cardPrice}>
          <Text style={styles.cardPriceBold}>{formatPrice(listing.pricePerNight)}</Text>
          <Text style={styles.cardPriceNight}> night</Text>
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [listings, setListings] = useState<ApiListingItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeCategory = useRef(selectedCategory);

  const fetchListings = useCallback(async (pageNum: number, category: ListingCategory | null, reset: boolean) => {
    if (loading && !reset) return;
    setLoading(true);
    setError(null);
    try {
      const type = category ? categoryToApiType(category) : undefined;
      const res = await api.getListings({ page: pageNum, limit: PAGE_SIZE, type });
      const newItems = res.data;
      setListings((prev) => (reset ? newItems : [...prev, ...newItems]));
      setHasMore(pageNum < res.meta.totalPages);
      setPage(pageNum);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load listings');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setInitialLoading(true);
    fetchListings(1, null, true);
  }, []);

  // Category change
  function handleCategorySelect(cat: ListingCategory | null) {
    setSelectedCategory(cat);
    activeCategory.current = cat;
    setInitialLoading(true);
    fetchListings(1, cat, true);
  }

  function loadMore() {
    if (!hasMore || loading) return;
    fetchListings(page + 1, selectedCategory, false);
  }

  const toggleSave = (id: string) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <SearchPill />
      </View>

      {/* Category filter */}
      <View style={styles.categoryWrap}>
        <CategoryFilter selected={selectedCategory} onSelect={handleCategorySelect} />
        <Pressable style={styles.filterIconBtn}>
          <Ionicons name="options-outline" size={18} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      {initialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={48} color={Colors.border} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => fetchListings(1, selectedCategory, true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              saved={savedIds.includes(item.id)}
              onToggleSave={toggleSave}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && !initialLoading ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Colors.brand} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No listings found.</Text>
            </View>
          }
        />
      )}

      {/* Map button */}
      <View style={styles.mapBtnWrap} pointerEvents="box-none">
        <Pressable style={styles.mapBtn}>
          <Text style={styles.mapBtnText}>Show map</Text>
          <Ionicons name="map-outline" size={16} color={Colors.white} style={{ marginLeft: 6 }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const CARD_W = SCREEN_W - Spacing.md * 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  searchPillText: { flex: 1 },
  searchPillTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  searchPillSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  filterBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  categoryWrap: { flexDirection: 'row', alignItems: 'center', paddingRight: Spacing.md },
  categoryScroll: { paddingHorizontal: Spacing.md, gap: Spacing.xl, paddingVertical: Spacing.sm },
  categoryItem: { alignItems: 'center', gap: 4, position: 'relative', paddingBottom: 6, minWidth: 56 },
  categoryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  categoryLabelActive: { color: Colors.text, fontWeight: '600' },
  categoryUnderline: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: Colors.text, borderRadius: 1,
  },
  filterIconBtn: {
    width: 38, height: 38, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.borderLight },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },
  retryBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.text,
  },
  retryBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 100 },
  cardSeparator: { height: Spacing.lg },
  footerLoader: { paddingVertical: Spacing.lg, alignItems: 'center' },

  card: { width: CARD_W },
  cardImageWrap: {
    position: 'relative', borderRadius: Radius.xl,
    overflow: 'hidden', backgroundColor: Colors.backgroundSecondary,
  },
  cardImage: { width: CARD_W, height: CARD_W * 0.72 },
  dotRow: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  imgDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  imgDotActive: { backgroundColor: Colors.white, width: 6, height: 6 },
  heartBtn: { position: 'absolute', top: 12, right: 12, padding: 2 },
  heartIcon: { textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 },

  cardDetails: { paddingTop: Spacing.sm, gap: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLocation: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
  cardType: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardPrice: { fontSize: FontSize.base, marginTop: 2 },
  cardPriceBold: { fontWeight: '700', color: Colors.text },
  cardPriceNight: { color: Colors.text, fontWeight: '400' },

  empty: { paddingTop: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },

  mapBtnWrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0, right: 0, alignItems: 'center',
  },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.backgroundDark, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 12, ...Shadow.md,
  },
  mapBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.base },
});
