import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SavedBadgeProps {
  count: number;
}

export default function SavedBadge({ count }: SavedBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {count} saved
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#101828',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
