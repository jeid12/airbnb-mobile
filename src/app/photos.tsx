import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, FontSize, Spacing } from '@/constants/theme';
import { api, getListingImages } from '@/services/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function PhotosModal() {
  const { listingId, index } = useLocalSearchParams<{ listingId: string; index: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(Number(index ?? 0));

  useEffect(() => {
    if (!listingId) return;
    api.getListing(listingId)
      .then((detail) => setImages(getListingImages(detail)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.actionBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.counter}>
          {loading ? '…' : `${current + 1} / ${images.length}`}
        </Text>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: current * SCREEN_W, y: 0 }}
            onMomentumScrollEnd={(e) => {
              setCurrent(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
            }}
            style={styles.pager}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.fullImage} contentFit="contain" />
            ))}
          </ScrollView>

          <View style={styles.thumbnailStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img, i) => (
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  counter: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pager: { flex: 1 },
  fullImage: { width: SCREEN_W, height: SCREEN_H - 200 },
  thumbnailStrip: {
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  thumb: { width: 72, height: 56, borderRadius: 8, marginRight: Spacing.sm, opacity: 0.6 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: Colors.text },
});
