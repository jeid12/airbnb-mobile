import React, { createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ApiListingItem } from '../../../../services/api';
import { Radius, Colors } from '../../../../constants/theme';

interface CardContextValue { listing: ApiListingItem }

const CardContext = createContext<CardContextValue | null>(null);

export function useCard(): CardContextValue {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error('useCard must be used inside <Card>');
  return ctx;
}

interface Props { listing: ApiListingItem; children: React.ReactNode; style?: object }

export default function Card({ listing, children, style }: Props) {
  return (
    <CardContext.Provider value={{ listing }}>
      <View style={[styles.card, style]}>{children}</View>
    </CardContext.Provider>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white },
});
