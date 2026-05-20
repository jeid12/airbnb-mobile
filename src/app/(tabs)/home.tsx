import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { debounce } from 'lodash';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useStore } from '@/store/StoreContext';
import { useListings } from '@/features/listings/hooks/useListings';
import { useFavorites } from '@/features/listings/hooks/useFavorites';
import Spinner from '@/shared/components/Spinner';
import type { ApiListingItem } from '@/services/api';
import type { ListingCategory } from '@/features/listings/types';
import { getListingImages, parseLocation, categoryToApiType } from '@/services/api';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - Spacing.md * 2;

function formatPrice(n: number): string {
  return `$${n.toLocaleString()}`;
}

// ─── Debounced search pill ────────────────────────────────────────────────────
function SearchPill({ onSearch }: { onSearch: () => void }) {
  const { state, dispatch } = useStore();
  const inputRef = useRef<TextInput>(null);

  const debouncedDispatch = useCallback(
    debounce((text: string) => dispatch({ type: 'SET_FILTER', payload: text }), 300),
    [dispatch],
  );

  return (
    <View style={styles.searchPill}>
      <Ionicons name="search" size={18} color={Colors.text} />
      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        placeholder="Where to?"
        placeholderTextColor={Colors.textSecondary}
        defaultValue={state.filter}
        onChangeText={debouncedDispatch}
        returnKeyType="search"
      />
      <Pressable style={styles.filterBtn} onPress={onSearch}>
        <Ionicons name="options-outline" size={16} color={Colors.text} />
      </Pressable>
    </View>
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
      {categories.map((cat) => {
        const active = selected === cat.id;
        return (
          <Pressable key={cat.id} style={styles.categoryItem} onPress={() => onSelect(active ? null : cat.id)}>
            <Ionicons name={cat.icon as any} size={22} color={active ? Colors.text : Colors.textSecondary} />
            <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{cat.label}</Text>
            {active && <View style={styles.categoryUnderline} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Animated listing card ────────────────────────────────────────────────────
function ListingCard({
  listing,
  index,
  saved,
  onToggleSave,
}: {
  listing: ApiListingItem;
  index: number;
  saved: boolean;
  onToggleSave: (id: string, title: string) => void;
}) {
  const images = getListingImages(listing);
  const [imgIndex, setImgIndex] = useState(0);
  const loc = parseLocation(listing.location);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(350).springify()}>
      <Pressable style={styles.card} onPress={() => router.push(`/listing/${listing.id}`)}>
        <View style={styles.cardImageWrap}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setImgIndex(Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - Spacing.md * 2)));
            }}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.cardImage} contentFit="cover" />
            ))}
          </ScrollView>

          {images.length > 1 && (
            <View style={styles.dotRow}>
              {images.map((_, i) => (
                <View key={i} style={[styles.imgDot, i === imgIndex && styles.imgDotActive]} />
              ))}
            </View>
          )}

          <Pressable
            style={styles.heartBtn}
            onPress={(e) => { e.stopPropagation?.(); onToggleSave(listing.id, listing.title); }}
            hitSlop={8}>
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={22}
              color={saved ? Colors.brand : Colors.white}
              style={styles.heartIcon}
            />
          </Pressable>

          {listing.host.isSuperhost && (
            <View style={styles.superhostBadge}>
              <Text style={styles.superhostBadgeText}>Superhost</Text>
            </View>
          )}
        </View>

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
    </Animated.View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);
  const { state } = useStore();
  const { isSaved, toggle } = useFavorites();

  // Kicks off TanStack Query → dispatches to store
  useListings({ type: selectedCategory ? categoryToApiType(selectedCategory) : undefined });

  const filtered = useMemo<ApiListingItem[]>(() => {
    const q = state.filter.trim().toLowerCase();
    return state.listings.filter((l) =>
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q),
    );
  }, [state.listings, state.filter]);

  const handleToggleSave = useCallback(
    (id: string, title: string) => toggle(id, title),
    [toggle],
  );

  function handleCategorySelect(cat: ListingCategory | null): void {
    setSelectedCategory(cat);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SearchPill onSearch={() => router.push('/search')} />
      </View>

      <View style={styles.categoryWrap}>
        <CategoryFilter selected={selectedCategory} onSelect={handleCategorySelect} />
        <Pressable style={styles.filterIconBtn}>
          <Ionicons name="options-outline" size={18} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      {state.loading ? (
        <View style={styles.centered}><Spinner /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="home-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>No listings found.</Text>
          {state.filter ? <Text style={styles.emptySubText}>Try a different search.</Text> : null}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ListingCard
              listing={item}
              index={index}
              saved={isSaved(item.id)}
              onToggleSave={handleToggleSave}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          ListEmptyComponent={null}
        />
      )}

      <View style={styles.mapBtnWrap} pointerEvents="box-none">
        <Pressable style={styles.mapBtn}>
          <Text style={styles.mapBtnText}>Show map</Text>
          <Ionicons name="map-outline" size={16} color={Colors.white} style={{ marginLeft: 6 }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  searchPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    gap: Spacing.sm, ...Shadow.md,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
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
  categoryUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.text, borderRadius: 1 },
  filterIconBtn: { width: 38, height: 38, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: '500' },
  emptySubText: { fontSize: FontSize.sm, color: Colors.textLight },
  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 100 },
  cardSeparator: { height: Spacing.lg },
  card: { width: CARD_W },
  cardImageWrap: { position: 'relative', borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.backgroundSecondary },
  cardImage: { width: CARD_W, height: CARD_W * 0.72 },
  dotRow: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  imgDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  imgDotActive: { backgroundColor: Colors.white, width: 6, height: 6 },
  heartBtn: { position: 'absolute', top: 12, right: 12, padding: 2 },
  heartIcon: { textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 },
  superhostBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: Colors.white, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  superhostBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
  cardDetails: { paddingTop: Spacing.sm, gap: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLocation: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
  cardType: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardPrice: { fontSize: FontSize.base, marginTop: 2 },
  cardPriceBold: { fontWeight: '700', color: Colors.text },
  cardPriceNight: { color: Colors.text, fontWeight: '400' },
  mapBtnWrap: { position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 80, left: 0, right: 0, alignItems: 'center' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundDark, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: 12, ...Shadow.md },
  mapBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.base },
});
