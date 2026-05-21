import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import StepWrapper from './_step';

const SUGGESTIONS = ['Downtown, New York', 'Brooklyn, New York', 'Los Angeles, California', 'Miami, Florida', 'Kigali, Rwanda', 'Nairobi, Kenya'];

export default function StepLocation() {
  const { draft, update } = useBecomeHost();

  return (
    <StepWrapper
      step={2} total={7}
      title="Where is your place located?"
      subtitle="Your address is only shared with guests after they book."
      onNext={() => router.push('/become-host/details')}
      nextDisabled={draft.location.trim().length < 3}>
      <View style={styles.wrap}>
        <TextInput
          style={styles.input}
          value={draft.location}
          onChangeText={(v) => update({ location: v })}
          placeholder="City, State / Country"
          placeholderTextColor={Colors.textLight}
          autoFocus
        />
        {!draft.location && (
          <View style={styles.suggestions}>
            <Text style={styles.suggLabel}>Popular locations</Text>
            {SUGGESTIONS.map((s) => (
              <View key={s} style={styles.suggRow}>
                <View style={styles.suggIcon} />
                <Text style={styles.suggText} onPress={() => update({ location: s })}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: FontSize.base, color: Colors.text },
  suggestions: { gap: Spacing.sm },
  suggLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  suggRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  suggIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.backgroundSecondary },
  suggText: { fontSize: FontSize.base, color: Colors.text },
});
