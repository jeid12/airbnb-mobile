import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { wishlists } from '@/data/wishlists';
import type { Wishlist } from '@/features/listings/types';

function WishlistCard({ wishlist }: { wishlist: Wishlist }) {
  const covers = wishlist.coverImages.slice(0, 4);

  return (
    <Pressable style={styles.card}>
      {/* 2×2 photo grid */}
      <View style={styles.photoGrid}>
        {[0, 1, 2, 3].map((i) => (
          <Image
            key={i}
            source={{ uri: covers[i] ?? covers[0] }}
            style={styles.photoGridItem}
            contentFit="cover"
          />
        ))}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{wishlist.name}</Text>
        <Text style={styles.cardCount}>
          {wishlist.items.length} {wishlist.items.length === 1 ? 'home' : 'homes'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function WishlistScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlists</Text>
        <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
      </View>

      <FlatList
        data={wishlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WishlistCard wishlist={item} />}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <Pressable style={styles.newBtn}>
            <View style={styles.newBtnIconWrap}>
              <Ionicons name="add" size={24} color={Colors.text} />
            </View>
            <Text style={styles.newBtnText}>Create new wishlist</Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const CARD_W = (Colors as any) && 160;

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

  listContent: { padding: Spacing.md, gap: Spacing.md },
  columnWrap: { gap: Spacing.md },

  card: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
    ...Shadow.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    aspectRatio: 1,
  },
  photoGridItem: {
    width: '50%',
    height: '50%',
  },
  cardInfo: { padding: Spacing.sm },
  cardName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  cardCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  newBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  newBtnIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
});
