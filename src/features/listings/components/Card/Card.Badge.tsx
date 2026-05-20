import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCard } from './Card';
import { Colors, FontSize, Radius } from '../../../../constants/theme';

export default function CardBadge() {
  const { listing } = useCard();
  if (!listing.host.isSuperhost) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Superhost</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { backgroundColor: '#FFF0F0', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 3 },
  text: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: '600' },
});
