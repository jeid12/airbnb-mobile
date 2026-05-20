import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { api, getListingImages } from '@/services/api';
import Spinner from '@/shared/components/Spinner';
import type { ApiListingItem } from '@/services/api';

function ListingModerationCard({ listing, onApprove, onReject }: {
  listing: ApiListingItem;
  onApprove: () => void;
  onReject: () => void;
}) {
  const img = getListingImages(listing)[0];
  return (
    <View style={styles.card}>
      <Image source={{ uri: img }} style={styles.cardImg} contentFit="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.cardMeta}>{listing.location}</Text>
        <Text style={styles.cardMeta}>{listing.type} · ${listing.pricePerNight}/night</Text>
        <Text style={styles.cardMeta}>Host: {listing.host.name}</Text>
        <View style={styles.cardActions}>
          <Pressable style={styles.approveBtn} onPress={onApprove}>
            <Ionicons name="checkmark" size={16} color={Colors.white} />
            <Text style={styles.approveBtnText}>Approve</Text>
          </Pressable>
          <Pressable style={styles.rejectBtn} onPress={onReject}>
            <Ionicons name="close" size={16} color={Colors.white} />
            <Text style={styles.rejectBtnText}>Reject</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function ModerationScreen() {
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'pending'],
    queryFn: async () => {
      const res = await api.getListings({ limit: 50 }, token);
      return res.data; // In production, filter by status=PENDING
    },
    enabled: !!token,
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      // Optimistic: remove from list
      qc.setQueryData<ApiListingItem[]>(['listings', 'pending'], (prev) =>
        prev?.filter((l) => l.id !== id) ?? [],
      );
    },
    onError: () => qc.invalidateQueries({ queryKey: ['listings', 'pending'] }),
  });

  function handleApprove(id: string, title: string) {
    remove.mutate(id);
    Toast.show({ type: 'success', text1: `Approved: ${title}` });
  }

  function handleReject(id: string, title: string) {
    Alert.prompt('Reject listing', 'Enter rejection reason (optional):', (reason) => {
      remove.mutate(id);
      Toast.show({ type: 'info', text1: `Rejected: ${title}`, text2: reason ?? '' });
    });
  }

  const listings = data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Moderation Queue</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{listings.length}</Text>
        </View>
      </View>

      {isLoading ? <Spinner /> : listings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={56} color={Colors.success} />
          <Text style={styles.emptyTitle}>All clear!</Text>
          <Text style={styles.emptyText}>No listings pending review.</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => (
            <ListingModerationCard
              listing={item}
              onApprove={() => handleApprove(item.id, item.title)}
              onReject={() => handleReject(item.id, item.title)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  countBadge: { backgroundColor: Colors.brand, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700' },
  list: { padding: Spacing.md, gap: Spacing.md },
  card: { borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.sm },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: Spacing.md, gap: 4 },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  cardMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.success, borderRadius: Radius.lg, paddingVertical: 10 },
  approveBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.sm },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ef4444', borderRadius: Radius.lg, paddingVertical: 10 },
  rejectBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
