import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useCreateBooking } from '@/features/bookings/hooks/useCreateBooking';
import {
  step1Schema, step2Schema, step3Schema,
  type Step1Data, type Step2Data, type Step3Data,
} from '@/features/bookings/schemas/booking';
import { useListing } from '@/features/listings/hooks/useListing';

// ─── Reusable field ───────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

function StyledInput(props: React.ComponentProps<typeof TextInput> & { hasError?: boolean }) {
  const { hasError, ...rest } = props;
  return (
    <TextInput
      style={[styles.input, hasError && styles.inputError]}
      placeholderTextColor={Colors.textLight}
      {...rest}
    />
  );
}

// ─── Step components ──────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: (d: Step1Data) => void }) {
  const { control, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { checkIn: '', checkOut: '', guests: 1 },
  });

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>When's your trip?</Text>

      <Field label="Check-in (YYYY-MM-DD)" error={errors.checkIn?.message}>
        <Controller control={control} name="checkIn" render={({ field }) => (
          <StyledInput placeholder="2025-08-01" hasError={!!errors.checkIn}
            onChangeText={field.onChange} value={field.value} />
        )} />
      </Field>

      <Field label="Check-out (YYYY-MM-DD)" error={errors.checkOut?.message}>
        <Controller control={control} name="checkOut" render={({ field }) => (
          <StyledInput placeholder="2025-08-07" hasError={!!errors.checkOut}
            onChangeText={field.onChange} value={field.value} />
        )} />
      </Field>

      <Field label="Guests" error={errors.guests?.message}>
        <Controller control={control} name="guests" render={({ field }) => (
          <StyledInput placeholder="1" keyboardType="numeric" hasError={!!errors.guests}
            onChangeText={(v) => field.onChange(parseInt(v, 10) || 1)} value={String(field.value)} />
        )} />
      </Field>

      <Pressable style={styles.nextBtn} onPress={handleSubmit(onNext)}>
        <Text style={styles.nextBtnText}>Continue</Text>
      </Pressable>
    </View>
  );
}

function Step2({ onNext }: { onNext: (d: Step2Data) => void }) {
  const { control, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Who's coming?</Text>

      <Field label="Full name" error={errors.name?.message}>
        <Controller control={control} name="name" render={({ field }) => (
          <StyledInput placeholder="Jane Doe" hasError={!!errors.name}
            onChangeText={field.onChange} value={field.value} />
        )} />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <Controller control={control} name="email" render={({ field }) => (
          <StyledInput placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none"
            hasError={!!errors.email} onChangeText={field.onChange} value={field.value} />
        )} />
      </Field>

      <Field label="Phone" error={errors.phone?.message}>
        <Controller control={control} name="phone" render={({ field }) => (
          <StyledInput placeholder="+1 555 0000" keyboardType="phone-pad" hasError={!!errors.phone}
            onChangeText={field.onChange} value={field.value} />
        )} />
      </Field>

      <Pressable style={styles.nextBtn} onPress={handleSubmit(onNext)}>
        <Text style={styles.nextBtnText}>Continue</Text>
      </Pressable>
    </View>
  );
}

function Step3({ onNext }: { onNext: (d: Step3Data) => void }) {
  const { control, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment details</Text>
      <Text style={styles.stepSub}>This is a mock payment form — no real charge will occur.</Text>

      <Field label="Card number (16 digits)" error={errors.card?.message}>
        <Controller control={control} name="card" render={({ field }) => (
          <StyledInput placeholder="1234567890123456" keyboardType="numeric" maxLength={16}
            hasError={!!errors.card} onChangeText={field.onChange} value={field.value} />
        )} />
      </Field>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Field label="Expiry (MM/YY)" error={errors.expiry?.message}>
            <Controller control={control} name="expiry" render={({ field }) => (
              <StyledInput placeholder="08/27" maxLength={5} hasError={!!errors.expiry}
                onChangeText={field.onChange} value={field.value} />
            )} />
          </Field>
        </View>
        <View style={{ width: Spacing.md }} />
        <View style={{ flex: 1 }}>
          <Field label="CVV" error={errors.cvv?.message}>
            <Controller control={control} name="cvv" render={({ field }) => (
              <StyledInput placeholder="123" keyboardType="numeric" maxLength={3}
                hasError={!!errors.cvv} onChangeText={field.onChange} value={field.value} secureTextEntry />
            )} />
          </Field>
        </View>
      </View>

      <Pressable style={styles.nextBtn} onPress={handleSubmit(onNext)}>
        <Text style={styles.nextBtnText}>Review booking</Text>
      </Pressable>
    </View>
  );
}

function Step4({
  listingTitle, step1, step2, onConfirm, isPending,
}: {
  listingTitle: string;
  step1: Step1Data;
  step2: Step2Data;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const nights =
    (new Date(step1.checkOut).getTime() - new Date(step1.checkIn).getTime()) / 86400000;

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review your booking</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryHeading}>{listingTitle}</Text>
        <View style={styles.divider} />
        <SummaryRow label="Check-in" value={step1.checkIn} />
        <SummaryRow label="Check-out" value={step1.checkOut} />
        <SummaryRow label="Nights" value={String(Math.max(nights, 1))} />
        <SummaryRow label="Guests" value={String(step1.guests)} />
        <View style={styles.divider} />
        <SummaryRow label="Guest name" value={step2.name} />
        <SummaryRow label="Email" value={step2.email} />
        <SummaryRow label="Phone" value={step2.phone} />
      </View>

      <Pressable style={[styles.confirmBtn, isPending && { opacity: 0.7 }]} onPress={onConfirm} disabled={isPending}>
        {isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
      </Pressable>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: listing } = useListing(id ?? '');
  const { mutate, isPending } = useCreateBooking();

  const [step, setStep] = useState(1);
  const [s1, setS1] = useState<Step1Data | null>(null);
  const [s2, setS2] = useState<Step2Data | null>(null);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Please log in to book a listing.</Text>
          <Pressable style={styles.nextBtn} onPress={() => router.push('/login')}>
            <Text style={styles.nextBtnText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const steps = ['Dates', 'Guests', 'Payment', 'Confirm'];

  function confirm() {
    if (!s1 || !id) return;
    mutate({ listingId: id, checkIn: s1.checkIn, checkOut: s1.checkOut, guests: s1.guests });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Book · Step {step} of 4</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` as any }]} />
      </View>

      {/* Step chips */}
      <View style={styles.stepsRow}>
        {steps.map((label, i) => (
          <View key={label} style={[styles.stepChip, i + 1 <= step && styles.stepChipActive]}>
            <Text style={[styles.stepChipText, i + 1 <= step && styles.stepChipTextActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 1 && <Step1 onNext={(d) => { setS1(d); setStep(2); }} />}
          {step === 2 && <Step2 onNext={(d) => { setS2(d); setStep(3); }} />}
          {step === 3 && <Step3 onNext={() => setStep(4)} />}
          {step === 4 && s1 && s2 && (
            <Step4
              listingTitle={listing?.title ?? 'Listing'}
              step1={s1}
              step2={s2}
              onConfirm={confirm}
              isPending={isPending}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  progressTrack: { height: 3, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.brand, borderRadius: 2 },
  stepsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  stepChip: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.backgroundSecondary },
  stepChipActive: { backgroundColor: Colors.brand },
  stepChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  stepChipTextActive: { color: Colors.white },
  scroll: { padding: Spacing.lg, paddingBottom: 48 },
  stepContent: { gap: Spacing.md },
  stepTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  stepSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 13, fontSize: FontSize.base, color: Colors.text },
  inputError: { borderColor: Colors.brand },
  fieldError: { fontSize: FontSize.xs, color: Colors.brand },
  row: { flexDirection: 'row' },
  nextBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: Spacing.sm },
  nextBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  summaryCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm },
  summaryHeading: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
  confirmBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
  confirmBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  errorText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
});
