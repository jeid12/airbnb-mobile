import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { api, type ApiListingDetail } from '@/services/api';

export default function AmenitiesModal() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [listing, setListing] = useState<ApiListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;
    api.getListing(listingId)
      .then(setListing)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId]);

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : !listing ? (
        <View style={styles.centered}>
          <Text style={styles.errText}>Could not load amenities.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.title}>What this place offers</Text>
          <Text style={styles.subtitle}>{listing.amenities.length} amenities</Text>

          <View style={styles.amenityList}>
            {listing.amenities.map((amenity, i) => (
              <View key={i} style={styles.amenityRow}>
                <Ionicons name="checkmark" size={20} color={Colors.text} />
                <Text style={styles.amenityName}>{amenity}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errText: { fontSize: FontSize.base, color: Colors.textSecondary },
  content: { padding: Spacing.md, paddingBottom: 48 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.lg },
  amenityList: { gap: 0 },
  amenityRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  amenityName: { fontSize: FontSize.base, color: Colors.text, flex: 1 },
});
