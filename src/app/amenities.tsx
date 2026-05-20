import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { listings } from '@/data/listings';

export default function AmenitiesModal() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const listing = listings.find((l) => l.id === listingId);

  if (!listing) return null;

  return (
    <View style={styles.container}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>What this place offers</Text>

        {listing.amenities.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupTitle}>{group.category}</Text>
            {group.items.map((item) => (
              <View key={item.name} style={[styles.amenityRow, !item.available && styles.unavailable]}>
                <Ionicons
                  name={item.available ? 'checkmark' : 'close'}
                  size={20}
                  color={item.available ? Colors.text : Colors.textSecondary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.amenityName, !item.available && styles.strikethrough]}>
                    {item.name}
                  </Text>
                  {item.note && (
                    <Text style={styles.amenityNote}>{item.note}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 48 },

  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },

  group: { gap: Spacing.sm },
  groupTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },

  amenityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  unavailable: { opacity: 0.5 },
  amenityName: { fontSize: FontSize.base, color: Colors.text },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  amenityNote: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
});
