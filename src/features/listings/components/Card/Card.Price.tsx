import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useCard } from './Card';
import { Colors, FontSize } from '../../../../constants/theme';

export default function CardPrice() {
  const { listing } = useCard();
  return (
    <Text style={styles.text}>
      <Text style={styles.bold}>${listing.pricePerNight}</Text> night
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: FontSize.base, color: Colors.text, marginTop: 2 },
  bold: { fontWeight: '700' },
});
