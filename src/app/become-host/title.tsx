import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import StepWrapper from './_step';

const MAX = 50;

export default function StepTitle() {
  const { draft, update } = useBecomeHost();
  const remaining = MAX - draft.title.length;

  return (
    <StepWrapper
      step={5} total={7}
      title="Give your listing a title"
      subtitle="A great title captures what makes your place special."
      onNext={() => router.push('/become-host/description')}
      nextDisabled={draft.title.trim().length < 5}>
      <View style={styles.wrap}>
        <TextInput
          style={[styles.input, draft.title.length > 0 && styles.inputFilled]}
          value={draft.title}
          onChangeText={(v) => update({ title: v.slice(0, MAX) })}
          placeholder="e.g. Cozy studio near the beach"
          placeholderTextColor={Colors.textLight}
          multiline
          maxLength={MAX}
          autoFocus
        />
        <Text style={[styles.counter, remaining < 10 && styles.counterWarn]}>
          {remaining} characters remaining
        </Text>
        <View style={styles.examples}>
          <Text style={styles.examplesTitle}>Tips for a great title:</Text>
          {['Highlight a unique feature', 'Mention your neighbourhood', 'Keep it short and punchy'].map((tip) => (
            <Text key={tip} style={styles.tip}>• {tip}</Text>
          ))}
        </View>
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.md, fontSize: FontSize.lg, color: Colors.text, minHeight: 100, textAlignVertical: 'top' },
  inputFilled: { borderColor: Colors.brand },
  counter: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  counterWarn: { color: Colors.brand },
  examples: { backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, padding: Spacing.md, gap: 4 },
  examplesTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  tip: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
