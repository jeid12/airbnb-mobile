import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface Props {
  size?: 'small' | 'large';
  color?: string;
}

export default function Spinner({ size = 'large', color = Colors.brand }: Props) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
