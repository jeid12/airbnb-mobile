import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import type { ListingType } from '@/services/api';
import StepWrapper from './_step';

const TYPES: { type: ListingType; emoji: string; label: string; sub: string }[] = [
  { type: 'APARTMENT', emoji: '🏢', label: 'Apartment', sub: 'A place within a multi-unit building' },
  { type: 'HOUSE', emoji: '🏡', label: 'House', sub: 'A standalone residential home' },
  { type: 'VILLA', emoji: '🏰', label: 'Villa', sub: 'A luxury property with premium features' },
  { type: 'CABIN', emoji: '🪵', label: 'Cabin', sub: 'A cozy retreat in nature' },
];

export default function StepType() {
  const { draft, update } = useBecomeHost();

  return (
    <StepWrapper step={1} total={7} title="What kind of place will you host?" onNext={() => router.push('/become-host/location')} nextDisabled={!draft.type}>
      <View style={styles.list}>
        {TYPES.map((t) => {
          const active = draft.type === t.type;
          return (
            <Pressable key={t.type} style={[styles.card, active && styles.cardActive]} onPress={() => update({ type: t.type })}>
              <Text style={styles.emoji}>{t.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
                <Text style={styles.sub}>{t.sub}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border },
  cardActive: { borderColor: Colors.brand, backgroundColor: '#fff0f3' },
  emoji: { fontSize: 28 },
  label: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  labelActive: { color: Colors.brand },
  sub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.brand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brand },
});
