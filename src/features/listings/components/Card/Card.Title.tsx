import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useCard } from './Card';
import { Colors, FontSize } from '../../../../constants/theme';

export default function CardTitle() {
  const { listing } = useCard();
  return <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
});
