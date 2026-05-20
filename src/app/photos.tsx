import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, FontSize, Spacing, Shadow } from '@/constants/theme';
import { listings } from '@/data/listings';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function PhotosModal() {
  const { listingId, index } = useLocalSearchParams<{ listingId: string; index: string }>();
  const listing = listings.find((l) => l.id === listingId);
  const [current, setCurrent] = useState(Number(index ?? 0));

  if (!listing) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.counter}>
          {current + 1} / {listing.images.length}
        </Text>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      {/* Full-screen image pager */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: current * SCREEN_W, y: 0 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setCurrent(idx);
        }}
        style={styles.pager}>
        {listing.images.map((img, i) => (
          <Image
            key={i}
            source={{ uri: img }}
            style={styles.fullImage}
            contentFit="contain"
          />
        ))}
      </ScrollView>

      {/* Thumbnail strip */}
      <View style={styles.thumbnailStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {listing.images.map((img, i) => (
            <Pressable key={i} onPress={() => setCurrent(i)}>
              <Image
                source={{ uri: img }}
                style={[styles.thumb, i === current && styles.thumbActive]}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pager: { flex: 1 },
  fullImage: { width: SCREEN_W, height: SCREEN_H - 200 },

  thumbnailStrip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  thumb: {
    width: 72,
    height: 56,
    borderRadius: 8,
    marginRight: Spacing.sm,
    opacity: 0.6,
  },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: Colors.text },
});
