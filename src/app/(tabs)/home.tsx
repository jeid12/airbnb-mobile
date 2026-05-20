import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing, Radius, FontSize, Shadow } from '@/constants/theme';
import { categories } from '@/data/categories';
import { listings } from '@/data/listings';
import type { Listing, ListingCategory } from '@/features/listings/types';

const { width: SCREEN_W } = Dimensions.get('window');

function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  listing: Listing;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);

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
          {listing.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.cardImage} contentFit="cover" />
          ))}
        </ScrollView>

        {/* Pagination dots */}
        {listing.images.length > 1 && (
          <View style={styles.dotRow}>
            {listing.images.map((_, i) => (
              <View key={i} style={[styles.imgDot, i === imageIndex && styles.imgDotActive]} />
            ))}
          </View>
        )}

        {/* Heart button */}
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

        {/* Guest favorite badge */}
        {listing.guestFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteBadgeText}>Guest favorite</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.cardDetails}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLocation} numberOfLines={1}>
            {listing.location.city}, {listing.location.country}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.text} />
            <Text style={styles.ratingText}>{listing.rating.overall.toFixed(2)}</Text>
          </View>
        </View>
        <Text style={styles.cardType} numberOfLines={1}>
          {listing.type}
        </Text>
        <Text style={styles.cardDates}>
          {formatDateShort(listing.availableFrom)}
          {listing.availableTo ? ` – ${formatDateShort(listing.availableTo)}` : ''}
        </Text>
        <Text style={styles.cardPrice}>
          <Text style={styles.cardPriceBold}>{formatPrice(listing.price.perNight)}</Text>
          <Text style={styles.cardPriceNight}> night</Text>
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Explore Screen ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const filtered = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings;

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
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <Pressable style={styles.filterIconBtn}>
          <Ionicons name="options-outline" size={18} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* Listing list */}
      <FlatList
        data={filtered}
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No listings found for this category.</Text>
          </View>
        }
      />

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

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category
  categoryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    paddingBottom: 6,
    minWidth: 56,
  },
  categoryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryLabelActive: { color: Colors.text, fontWeight: '600' },
  categoryUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.text,
    borderRadius: 1,
  },
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.borderLight },

  // List
  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 100 },
  cardSeparator: { height: Spacing.lg },

  // Card
  card: { width: CARD_W },
  cardImageWrap: {
    position: 'relative',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
  },
  cardImage: { width: CARD_W, height: CARD_W * 0.72 },
  dotRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  imgDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  imgDotActive: { backgroundColor: Colors.white, width: 6, height: 6 },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 2,
  },
  heartIcon: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 4,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  favoriteBadgeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },

  // Card details
  cardDetails: { paddingTop: Spacing.sm, gap: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLocation: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
  cardType: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardDates: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardPrice: { fontSize: FontSize.base, marginTop: 2 },
  cardPriceBold: { fontWeight: '700', color: Colors.text },
  cardPriceNight: { color: Colors.text, fontWeight: '400' },

  // Empty
  empty: { paddingTop: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },

  // Map button
  mapBtnWrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    ...Shadow.md,
  },
  mapBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.base },
});
