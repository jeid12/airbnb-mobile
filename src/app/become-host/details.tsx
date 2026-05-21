import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import StepWrapper from './_step';

function Counter({ label, sub, value, onInc, onDec, min = 0 }: { label: string; sub?: string; value: number; onInc: () => void; onDec: () => void; min?: number }) {
  return (
    <View style={styles.counterRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.counterLabel}>{label}</Text>
        {sub && <Text style={styles.counterSub}>{sub}</Text>}
      </View>
      <View style={styles.counterControls}>
        <Pressable style={[styles.counterBtn, value <= min && styles.counterBtnDisabled]} onPress={onDec} disabled={value <= min}>
          <Ionicons name="remove" size={18} color={value <= min ? Colors.border : Colors.text} />
        </Pressable>
        <Text style={styles.counterValue}>{value}</Text>
        <Pressable style={styles.counterBtn} onPress={onInc}>
          <Ionicons name="add" size={18} color={Colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

export default function StepDetails() {
  const { draft, update } = useBecomeHost();

  return (
    <StepWrapper step={3} total={7} title="How many can your place accommodate?" onNext={() => router.push('/become-host/amenities')}>
      <View style={styles.list}>
        <Counter label="Guests" value={draft.guests} min={1} onInc={() => update({ guests: draft.guests + 1 })} onDec={() => update({ guests: Math.max(1, draft.guests - 1) })} />
        <View style={styles.divider} />
        <Counter label="Bedrooms" value={draft.bedrooms} min={0} onInc={() => update({ bedrooms: draft.bedrooms + 1 })} onDec={() => update({ bedrooms: Math.max(0, draft.bedrooms - 1) })} />
        <View style={styles.divider} />
        <Counter label="Beds" value={draft.beds} min={1} onInc={() => update({ beds: draft.beds + 1 })} onDec={() => update({ beds: Math.max(1, draft.beds - 1) })} />
        <View style={styles.divider} />
        <Counter label="Bathrooms" sub="Shared or private" value={draft.bathrooms} min={1} onInc={() => update({ bathrooms: draft.bathrooms + 1 })} onDec={() => update({ bathrooms: Math.max(1, draft.bathrooms - 1) })} />
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  counterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  counterLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.text },
  counterSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  counterBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  counterBtnDisabled: { borderColor: Colors.borderLight },
  counterValue: { width: 24, textAlign: 'center', fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
});
