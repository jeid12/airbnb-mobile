import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type ReportStep = 'reason' | 'feedback' | 'done';

const REPORT_REASONS = [
  { id: 'inaccurate', label: "It's inaccurate or incorrect" },
  { id: 'not_a_real_place', label: "It's not a real place to stay" },
  { id: 'scam', label: "It's a scam" },
  { id: 'offensive', label: "It's offensive" },
  { id: 'something_else', label: "It's something else" },
];

const FEEDBACK_OPTIONS = [
  { id: 'page', label: 'Something on this page' },
  { id: 'host_money', label: 'The host is asking for more money' },
  { id: 'not_clean', label: "It doesn't look clean or safe" },
  { id: 'duplicate', label: "It's a duplicate listing" },
  { id: 'abusive', label: "I don't think it's allowed in my neighborhood" },
  { id: 'disturbing', label: "It's disturbing my neighborhood" },
];

function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.option} onPress={onPress}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

export default function ReportModal() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [step, setStep] = useState<ReportStep>('reason');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  if (step === 'done') {
    return (
      <View style={styles.container}>
        <View style={styles.handle} />
        <View style={styles.doneWrap}>
          <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
          <Text style={styles.doneTitle}>Help us improve</Text>
          <Text style={styles.doneSub}>
            We want to hear what you think we can do better. We'll review every piece of feedback
            individually.
          </Text>
          <Pressable style={styles.feedbackBtn}>
            <Text style={styles.feedbackBtnText}>Provide feedback</Text>
          </Pressable>
          <Pressable style={styles.okBtn} onPress={() => router.back()}>
            <Text style={styles.okBtnText}>OK</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => (step === 'feedback' ? setStep('reason') : router.back())}>
          <Ionicons name={step === 'feedback' ? 'arrow-back' : 'close'} size={22} color={Colors.text} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Why are you reporting this listing?</Text>
        {step === 'reason' && (
          <Text style={styles.subtitle}>This won't be shared with the Host.</Text>
        )}

        <View style={styles.options}>
          {(step === 'reason' ? REPORT_REASONS : FEEDBACK_OPTIONS).map((item) => (
            <View key={item.id}>
              <RadioOption
                label={item.label}
                selected={
                  step === 'reason'
                    ? selectedReason === item.id
                    : selectedFeedback === item.id
                }
                onPress={() => {
                  if (step === 'reason') setSelectedReason(item.id);
                  else setSelectedFeedback(item.id);
                }}
              />
              <View style={styles.separator} />
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.nextBtn,
            !(step === 'reason' ? selectedReason : selectedFeedback) && styles.nextBtnDisabled,
          ]}
          disabled={!(step === 'reason' ? selectedReason : selectedFeedback)}
          onPress={() => {
            if (step === 'reason') setStep('feedback');
            else setStep('done');
          }}>
          <Text style={styles.nextBtnText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  content: { flex: 1, padding: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },

  options: { marginTop: Spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  optionLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.text },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.text },
  separator: { height: 1, backgroundColor: Colors.borderLight },

  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  nextBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: Colors.backgroundSecondary },
  nextBtnText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },

  // Done screen
  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  doneTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  doneSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  feedbackBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.text,
  },
  feedbackBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  okBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.text,
  },
  okBtnText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },
});
