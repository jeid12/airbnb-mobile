import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useFavorites } from '@/features/listings/hooks/useFavorites';
import { getListingImages, parseLocation } from '@/services/api';
import type { ApiListingItem } from '@/services/api';

// Wishlists are stored locally in the global store (no backend endpoint).
// The `saved` array in the store holds the IDs; `savedListings` cross-references
// those IDs with the fetched listings.

function SavedCard({ listing, onRemove }: { listing: ApiListingItem; onRemove: () => void }) {
  const images = getListingImages(listing);
  const loc = parseLocation(listing.location);

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/listing/${listing.id}`)}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: images[0] }} style={styles.img} contentFit="cover" />
        <Pressable style={styles.removeBtn} onPress={(e) => { e.stopPropagation?.(); onRemove(); }}>
          <Ionicons name="heart" size={20} color={Colors.brand} />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.location} numberOfLines={1}>
          {loc.city}{loc.region ? `, ${loc.region}` : ''}
        </Text>
        <Text style={styles.type} numberOfLines={1}>{listing.type.charAt(0) + listing.type.slice(1).toLowerCase()}</Text>
        <Text style={styles.price}>
          <Text style={styles.priceBold}>${listing.pricePerNight}</Text> night
        </Text>
        {listing.rating != null && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.text} />
            <Text style={styles.ratingText}>{Number(listing.rating).toFixed(1)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function WishlistScreen() {
  const { savedListings, toggle, count } = useFavorites();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlists</Text>
        <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
      </View>

      {count === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={Colors.border} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart on any listing to save it here.
          </Text>
          <Pressable style={styles.browseBtn} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.browseBtnText}>Browse listings</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.countText}>{count} saved {count === 1 ? 'place' : 'places'}</Text>
          <FlatList
            data={savedListings}
            keyExtractor={(l) => l.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrap}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SavedCard
                listing={item}
                onRemove={() => toggle(item.id, item.title)}
              />
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  countText: { fontSize: FontSize.sm, color: Colors.textSecondary, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  listContent: { padding: Spacing.md, gap: Spacing.md },
  columnWrap: { gap: Spacing.md },
  card: { flex: 1, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white, ...Shadow.sm },
  imgWrap: { position: 'relative', aspectRatio: 1 },
  img: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  info: { padding: Spacing.sm, gap: 2 },
  location: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  type: { fontSize: FontSize.xs, color: Colors.textSecondary },
  price: { fontSize: FontSize.sm, color: Colors.text, marginTop: 2 },
  priceBold: { fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingText: { fontSize: FontSize.xs, color: Colors.text, fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  browseBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.sm },
  browseBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.base },
});
