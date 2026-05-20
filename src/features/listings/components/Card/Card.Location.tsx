import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useCard } from './Card';
import { Colors, FontSize } from '../../../../constants/theme';
import { parseLocation } from '../../../../services/api';

export default function CardLocation() {
  const { listing } = useCard();
  const { city, region } = parseLocation(listing.location);
  return <Text style={styles.text}>{city}{region ? `, ${region}` : ''}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
