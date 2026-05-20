import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Dimensions } from 'react-native';
import { useCard } from './Card';
import { getListingImages } from '../../../../services/api';

const W = Dimensions.get('window').width;

export default function CardImage() {
  const { listing } = useCard();
  const images = getListingImages(listing);
  return (
    <Image source={{ uri: images[0] }} style={styles.img} contentFit="cover" />
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', height: W * 0.6, backgroundColor: '#f0f0f0' },
});
