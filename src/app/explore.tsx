import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { api, getListingImages, parseLocation } from '@/services/api';
import type { ApiListingItem, ListingType } from '@/services/api';

const { width: W } = Dimensions.get('window');

const TYPES: ListingType[] = ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN'];
const TYPE_ICONS: Record<string, string> = {
  APARTMENT: '🏢', HOUSE: '🏡', VILLA: '🏰', CABIN: '🪵',
};

const QUICK_SEARCHES = [
  'cabin in the mountains for 4 guests',
  'villa with pool under $300',
  'apartment in New York',
  'beachfront house for family',
  'cozy cabin under $150',
];

function ListingCard({ listing, index }: { listing: ApiListingItem; index: number }) {
  const images = getListingImages(listing);
  const loc = parseLocation(listing.location);

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <Pressable style={styles.card} onPress={() => router.push(`/listing/${listing.id}` as any)}>
        <Image source={{ uri: images[0] }} style={styles.cardImg} contentFit="cover" />
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLocation} numberOfLines={1}>
              {loc.city}{loc.region ? `, ${loc.region}` : ''}
            </Text>
            {listing.rating != null && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={Colors.text} />
                <Text style={styles.ratingText}>{Number(listing.rating).toFixed(1)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardType}>{listing.type} · {listing.guests} guests</Text>
          <Text style={styles.cardPrice}>
            <Text style={styles.cardPriceBold}>${listing.pricePerNight}</Text> night
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiListingItem[]>([]);
  const [extractedFilters, setExtractedFilters] = useState<Record<string, string | number | null>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeType, setActiveType] = useState<ListingType | null>(null);
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function search(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    setQuery(q);
    try {
      const res = await api.aiSearch(q.trim(), 1, 30);
      setResults(res.data ?? []);
      setExtractedFilters(res.filters as Record<string, string | number | null>);
    } catch (e: any) {
      // Fallback to regular search
      try {
        const fallback = await api.searchListings({
          location: q,
          type: activeType ?? undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          limit: 30,
        });
        setResults(fallback.data ?? []);
        setExtractedFilters({});
      } catch {
        setError('Search failed. Please try again.');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters() {
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const res = await api.searchListings({
        type: activeType ?? undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        limit: 30,
      });
      setResults(res.data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() =>
    activeType ? results.filter((l) => l.type === activeType) : results,
    [results, activeType],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Explore</Text>
        <Pressable style={styles.aiChatBtn} onPress={() => router.push('/ai/chat' as any)}>
          <Ionicons name="sparkles" size={18} color={Colors.brand} />
          <Text style={styles.aiChatBtnText}>AI</Text>
        </Pressable>
      </View>

      {/* AI Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Describe your perfect stay…"
          placeholderTextColor={Colors.textLight}
          returnKeyType="search"
          onSubmitEditing={() => search(query)}
        />
        {loading
          ? <ActivityIndicator size="small" color={Colors.brand} style={styles.searchAction} />
          : query.trim()
            ? (
              <Pressable style={styles.searchAction} onPress={() => search(query)}>
                <Ionicons name="send" size={18} color={Colors.brand} />
              </Pressable>
            )
            : null}
      </View>

      {/* AI hint */}
      {!searched && (
        <View style={styles.aiHint}>
          <Ionicons name="sparkles-outline" size={14} color={Colors.brand} />
          <Text style={styles.aiHintText}>Powered by AI — try natural language search</Text>
        </View>
      )}

      {/* Type filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
        {TYPES.map((t) => (
          <Pressable
            key={t}
            style={[styles.typeChip, activeType === t && styles.typeChipActive]}
            onPress={() => {
              const next = activeType === t ? null : t;
              setActiveType(next);
              if (searched) applyFilters();
            }}>
            <Text style={styles.typeEmoji}>{TYPE_ICONS[t]}</Text>
            <Text style={[styles.typeText, activeType === t && styles.typeTextActive]}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </Text>
          </Pressable>
        ))}

        {/* Max price chip */}
        <View style={styles.priceChip}>
          <Ionicons name="pricetag-outline" size={14} color={Colors.textSecondary} />
          <TextInput
            style={styles.priceInput}
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Max $"
            placeholderTextColor={Colors.textLight}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={applyFilters}
          />
        </View>
      </ScrollView>

      {!searched ? (
        <ScrollView contentContainerStyle={styles.quickWrap} showsVerticalScrollIndicator={false}>
          <Text style={styles.quickTitle}>Try asking</Text>
          {QUICK_SEARCHES.map((q) => (
            <Pressable key={q} style={styles.quickItem} onPress={() => search(q)}>
              <Ionicons name="sparkles-outline" size={16} color={Colors.brand} />
              <Text style={styles.quickText}>{q}</Text>
            </Pressable>
          ))}

          <Text style={[styles.quickTitle, { marginTop: Spacing.lg }]}>Or browse by type</Text>
          <View style={styles.browseGrid}>
            {TYPES.map((t) => (
              <Pressable
                key={t}
                style={styles.browseCard}
                onPress={() => { setActiveType(t); applyFilters(); }}>
                <Text style={styles.browseEmoji}>{TYPE_ICONS[t]}</Text>
                <Text style={styles.browseLabel}>{t.charAt(0) + t.slice(1).toLowerCase()}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={styles.loadingText}>Searching with AI…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.border} />
          <Text style={styles.errText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => search(query)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Extracted filters display */}
          {Object.values(extractedFilters).some(Boolean) && (
            <View style={styles.filtersBar}>
              <Ionicons name="sparkles" size={13} color={Colors.brand} />
              <Text style={styles.filtersText} numberOfLines={1}>
                AI found: {Object.entries(extractedFilters)
                  .filter(([, v]) => v)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}
              </Text>
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(l) => l.id}
            renderItem={({ item, index }) => <ListingCard listing={item} index={index} />}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                {filtered.length} place{filtered.length !== 1 ? 's' : ''} found
              </Text>
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Ionicons name="home-outline" size={48} color={Colors.border} />
                <Text style={styles.emptyText}>No places found</Text>
                <Text style={styles.emptySubText}>Try a different search or remove filters</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  aiChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff0f3', borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  aiChatBtnText: { fontSize: FontSize.sm, color: Colors.brand, fontWeight: '700' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, backgroundColor: Colors.white, ...Shadow.sm },
  searchIcon: { marginRight: 4 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: FontSize.base, color: Colors.text },
  searchAction: { padding: 4 },

  aiHint: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  aiHintText: { fontSize: FontSize.xs, color: Colors.brand },

  typeRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm, paddingVertical: 7 },
  typeChipActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  typeEmoji: { fontSize: 14 },
  typeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  typeTextActive: { color: Colors.white },
  priceChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm, paddingVertical: 7 },
  priceInput: { width: 55, fontSize: FontSize.sm, color: Colors.text },

  quickWrap: { padding: Spacing.md, paddingBottom: 40 },
  quickTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  quickItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  quickText: { fontSize: FontSize.base, color: Colors.text, flex: 1 },
  browseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  browseCard: { width: (W - Spacing.md * 2 - Spacing.sm) / 2, backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', gap: 6 },
  browseEmoji: { fontSize: 32 },
  browseLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  filtersBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  filtersText: { fontSize: FontSize.xs, color: Colors.brand, flex: 1 },
  resultsCount: { fontSize: FontSize.sm, color: Colors.textSecondary, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  resultsList: { paddingHorizontal: Spacing.md, paddingBottom: 40 },

  card: { marginBottom: Spacing.md, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  cardImg: { width: '100%', height: 180 },
  cardBody: { padding: Spacing.sm, gap: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLocation: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.text },
  cardType: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardPrice: { fontSize: FontSize.sm, color: Colors.text, marginTop: 2 },
  cardPriceBold: { fontWeight: '700' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  loadingText: { fontSize: FontSize.base, color: Colors.textSecondary },
  errText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.text },
  retryText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  emptySubText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
});
