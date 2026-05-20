import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { api, getListingImages, parseLocation, type ApiWishlist } from '@/services/api';

// ─── Wishlist Card ────────────────────────────────────────────────────────────
function WishlistCard({ wishlist, onPress }: { wishlist: ApiWishlist; onPress: () => void }) {
  const items = wishlist.items;
  const covers = items.slice(0, 4).map((i) =>
    getListingImages({ type: 'APARTMENT' })[0]
  );
  const placeholder = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=60';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photoGrid}>
        {[0, 1, 2, 3].map((i) => (
          <Image
            key={i}
            source={{ uri: covers[i] ?? placeholder }}
            style={styles.photoGridItem}
            contentFit="cover"
          />
        ))}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{wishlist.name}</Text>
        <Text style={styles.cardCount}>
          {items.length} {items.length === 1 ? 'home' : 'homes'}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  return (
    <View style={styles.authGate}>
      <Ionicons name="heart-outline" size={48} color={Colors.border} />
      <Text style={styles.authTitle}>Log in to see wishlists</Text>
      <Text style={styles.authSub}>
        Save your favourite listings and access them anytime by logging in.
      </Text>
      <Pressable style={styles.authBtn} onPress={() => router.push('/login')}>
        <Text style={styles.authBtnText}>Log in</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/register')}>
        <Text style={styles.authLink}>Create account</Text>
      </Pressable>
    </View>
  );
}

// ─── Wishlist Screen ──────────────────────────────────────────────────────────
export default function WishlistScreen() {
  const { token } = useAuth();
  const [wishlists, setWishlists] = useState<ApiWishlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadWishlists = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWishlists(token);
      setWishlists(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load wishlists');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWishlists();
  }, [loadWishlists]);

  async function handleCreate() {
    if (!token || creating) return;
    Alert.prompt(
      'New wishlist',
      'Enter a name for your wishlist',
      async (name) => {
        if (!name?.trim()) return;
        setCreating(true);
        try {
          const wl = await api.createWishlist(token, name.trim());
          setWishlists((prev) => [...prev, wl]);
        } catch (e: any) {
          Alert.alert('Error', e.message ?? 'Failed to create wishlist');
        } finally {
          setCreating(false);
        }
      },
      'plain-text',
      'My Wishlist',
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlists</Text>
        <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
      </View>

      {!token ? (
        <AuthGate />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={loadWishlists}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={wishlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WishlistCard
              wishlist={item}
              onPress={() => {}}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="heart-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyTitle}>No wishlists yet</Text>
              <Text style={styles.emptyText}>Save listings you love and create wishlists to organise them.</Text>
            </View>
          }
          ListFooterComponent={
            <Pressable style={styles.newBtn} onPress={handleCreate} disabled={creating}>
              <View style={styles.newBtnIconWrap}>
                {creating ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <Ionicons name="add" size={24} color={Colors.text} />
                )}
              </View>
              <Text style={styles.newBtnText}>Create new wishlist</Text>
            </Pressable>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.text,
  },
  retryBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  // Auth gate
  authGate: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  authTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  authSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  authBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.sm,
  },
  authBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  authLink: { fontSize: FontSize.base, color: Colors.text, fontWeight: '600', textDecorationLine: 'underline' },

  // List
  listContent: { padding: Spacing.md, gap: Spacing.md },
  columnWrap: { gap: Spacing.md },

  card: {
    flex: 1, borderRadius: Radius.xl, overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary, ...Shadow.sm,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', aspectRatio: 1 },
  photoGridItem: { width: '50%', height: '50%' },
  cardInfo: { padding: Spacing.sm },
  cardName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  cardCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  // Empty
  emptyBox: {
    alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  // New button
  newBtn: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  newBtnIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 1.5, borderColor: Colors.text,
    alignItems: 'center', justifyContent: 'center',
  },
  newBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
});
