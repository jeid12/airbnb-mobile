import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import Spinner from './Spinner';
import { Colors, FontSize, Spacing } from '../../constants/theme';

interface Props<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  loading?: boolean;
}

export default function List<T>({ items, renderItem, keyExtractor, emptyMessage = 'No items found', loading = false }: Props<T>) {
  if (loading) return <Spinner />;
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => <>{renderItem(item, index)}</>}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
});
