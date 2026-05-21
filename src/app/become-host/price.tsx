import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import StepWrapper from './_step';

const PRESETS = [50, 75, 100, 150, 200, 300];

export default function StepPrice() {
  const { draft, update } = useBecomeHost();

  return (
    <StepWrapper
      step={7} total={7}
      title="Set your nightly price"
      subtitle="You can always change it later. Start competitive and adjust as you get reviews."
      onNext={() => router.push('/become-host/finish')}
      nextLabel="Review & publish"
      nextDisabled={draft.pricePerNight < 10}>
      <View style={styles.wrap}>
        <View style={styles.priceBox}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={String(draft.pricePerNight)}
            onChangeText={(v) => {
              const n = parseFloat(v);
              if (!isNaN(n)) update({ pricePerNight: n });
              else if (v === '') update({ pricePerNight: 0 });
            }}
            keyboardType="numeric"
            autoFocus
          />
          <Text style={styles.perNight}>/night</Text>
        </View>

        <Text style={styles.presetsLabel}>Quick picks</Text>
        <View style={styles.presetsRow}>
          {PRESETS.map((p) => (
            <View key={p} style={[styles.presetChip, draft.pricePerNight === p && styles.presetChipActive]}>
              <Text
                style={[styles.presetText, draft.pricePerNight === p && styles.presetTextActive]}
                onPress={() => update({ pricePerNight: p })}>
                ${p}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Pricing tip</Text>
          <Text style={styles.tipText}>
            New listings often do better starting $20–30 below similar places nearby. After a few bookings, raise your price.
          </Text>
        </View>
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },
  priceBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 2, borderColor: Colors.brand, borderRadius: Radius.xl, padding: Spacing.lg },
  currency: { fontSize: 36, fontWeight: '700', color: Colors.text },
  priceInput: { fontSize: 56, fontWeight: '700', color: Colors.text, minWidth: 80, textAlign: 'center' },
  perNight: { fontSize: FontSize.base, color: Colors.textSecondary, alignSelf: 'flex-end', marginBottom: 8 },
  presetsLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  presetChipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  presetText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textSecondary },
  presetTextActive: { color: Colors.white },
  tipCard: { backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, padding: Spacing.md, gap: 4 },
  tipTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  tipText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
