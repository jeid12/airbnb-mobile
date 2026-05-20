import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useMyListings, useDeleteListing } from '@/features/host/hooks/useHostListings';
import { getListingImages } from '@/services/api';
import { Image } from 'expo-image';
import Spinner from '@/shared/components/Spinner';
import type { ApiListingItem } from '@/services/api';

function ListingRow({ listing, onDelete }: { listing: ApiListingItem; onDelete: () => void }) {
  const img = getListingImages(listing)[0];
  return (
    <View style={styles.card}>
      <Image source={{ uri: img }} style={styles.cardImg} contentFit="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.cardMeta}>{listing.location} · ${listing.pricePerNight}/night</Text>
        <Text style={styles.cardType}>{listing.type}</Text>
        <View style={styles.cardActions}>
          <Pressable style={styles.editBtn} onPress={() => router.push(`/host/edit/${listing.id}`)}>
            <Ionicons name="pencil-outline" size={14} color={Colors.text} />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.viewBtn} onPress={() => router.push(`/listing/${listing.id}` as any)}>
            <Ionicons name="eye-outline" size={14} color={Colors.brand} />
            <Text style={[styles.editBtnText, { color: Colors.brand }]}>View</Text>
          </Pressable>
          <Pressable style={styles.deleteBtn} onPress={() => {
            Alert.alert('Delete listing', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]);
          }}>
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function MyListingsScreen() {
  const { data: listings, isLoading } = useMyListings();
  const { remove } = useDeleteListing();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>My Listings</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/host/create' as any)}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>
      </View>

      {isLoading ? <Spinner /> : (
        <FlatList
          data={listings ?? []}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => <ListingRow listing={item} onDelete={() => remove(item.id)} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="home-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Pressable style={styles.createBtn} onPress={() => router.push('/host/create' as any)}>
                <Text style={styles.createBtnText}>Create your first listing</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, gap: Spacing.md },
  card: { flexDirection: 'row', borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.sm },
  cardImg: { width: 100, height: 110 },
  cardBody: { flex: 1, padding: Spacing.sm, gap: 3 },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  cardMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cardType: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fff0f3', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  deleteBtn: { padding: 4 },
  editBtnText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  createBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 12 },
  createBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.base },
});
