import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCard } from './Card';
import { Colors, FontSize } from '../../../../constants/theme';

export default function CardRating() {
  const { listing } = useCard();
  return (
    <View style={styles.row}>
      <Ionicons name="star" size={12} color={Colors.text} />
      <Text style={styles.text}>{listing.rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  text: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
});
