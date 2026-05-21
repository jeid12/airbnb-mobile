import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import StepWrapper from './_step';

const MAX = 500;
const MIN = 50;

export default function StepDescription() {
  const { draft, update } = useBecomeHost();
  const len = draft.description.trim().length;

  return (
    <StepWrapper
      step={6} total={7}
      title="Describe your place"
      subtitle={`Tell guests what makes your place special. Minimum ${MIN} characters.`}
      onNext={() => router.push('/become-host/price')}
      nextDisabled={len < MIN}>
      <View style={styles.wrap}>
        <TextInput
          style={[styles.input, len > 0 && styles.inputFilled, len >= MIN && styles.inputOk]}
          value={draft.description}
          onChangeText={(v) => update({ description: v.slice(0, MAX) })}
          placeholder="Describe the space, what guests have access to, and the neighbourhood..."
          placeholderTextColor={Colors.textLight}
          multiline
          maxLength={MAX}
          textAlignVertical="top"
          autoFocus
        />
        <View style={styles.row}>
          <Text style={[styles.minHint, len >= MIN && styles.minHintOk]}>
            {len < MIN ? `${MIN - len} more characters needed` : '✓ Minimum reached'}
          </Text>
          <Text style={styles.counter}>{len}/{MAX}</Text>
        </View>
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.md, fontSize: FontSize.base, color: Colors.text, minHeight: 200, textAlignVertical: 'top', lineHeight: 22 },
  inputFilled: { borderColor: Colors.border },
  inputOk: { borderColor: Colors.success },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  minHint: { fontSize: FontSize.xs, color: Colors.brand },
  minHintOk: { color: Colors.success },
  counter: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
