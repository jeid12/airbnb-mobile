import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useListing } from '@/features/listings/hooks/useListing';
import { listingSchema, type ListingFormData } from '@/features/host/schemas/listing';
import Spinner from '@/shared/components/Spinner';

const TYPES = ['APARTMENT', 'VILLA', 'CABIN', 'HOUSE'] as const;

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading } = useListing(id ?? '');
  const qc = useQueryClient();

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: { title: '', description: '', location: '', pricePerNight: 50, type: 'APARTMENT', guests: 2 },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        description: listing.description,
        location: listing.location,
        pricePerNight: listing.pricePerNight,
        type: listing.type as ListingFormData['type'],
        guests: listing.guests,
      });
    }
  }, [listing, reset]);

  async function onSubmit(data: ListingFormData) {
    await new Promise((r) => setTimeout(r, 600));
    // Optimistic update
    qc.setQueryData(['listing', id], (old: typeof listing) => old ? { ...old, ...data } : old);
    qc.invalidateQueries({ queryKey: ['listings'] });
    Toast.show({ type: 'success', text1: 'Listing updated!' });
    router.back();
  }

  if (isLoading) return <Spinner />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Edit listing</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {[
            { name: 'title' as const, label: 'Title', placeholder: 'Your listing title' },
            { name: 'location' as const, label: 'Location', placeholder: 'City, Country' },
          ].map(({ name, label, placeholder }) => (
            <View key={name} style={styles.fieldWrap}>
              <Text style={styles.label}>{label}</Text>
              <Controller control={control} name={name} render={({ field }) => (
                <TextInput style={[styles.input, errors[name] && styles.inputErr]}
                  placeholder={placeholder} placeholderTextColor={Colors.textLight}
                  onChangeText={field.onChange} value={field.value as string} />
              )} />
              {errors[name] && <Text style={styles.err}>{errors[name]?.message}</Text>}
            </View>
          ))}

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Description</Text>
            <Controller control={control} name="description" render={({ field }) => (
              <TextInput style={[styles.input, styles.textarea, errors.description && styles.inputErr]}
                placeholder="Describe your place…" placeholderTextColor={Colors.textLight}
                multiline numberOfLines={5} textAlignVertical="top"
                onChangeText={field.onChange} value={field.value} />
            )} />
            {errors.description && <Text style={styles.err}>{errors.description.message}</Text>}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Price per night ($)</Text>
            <Controller control={control} name="pricePerNight" render={({ field }) => (
              <TextInput style={[styles.input, errors.pricePerNight && styles.inputErr]}
                keyboardType="numeric" placeholderTextColor={Colors.textLight}
                onChangeText={(v) => field.onChange(parseFloat(v) || 0)} value={String(field.value)} />
            )} />
            {errors.pricePerNight && <Text style={styles.err}>{errors.pricePerNight.message}</Text>}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <Pressable key={t} style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
                  onPress={() => setValue('type', t)}>
                  <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text style={styles.submitBtnText}>{isSubmitting ? 'Saving…' : 'Save changes'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  scroll: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.md },
  fieldWrap: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 13, fontSize: FontSize.base, color: Colors.text },
  textarea: { height: 120 },
  inputErr: { borderColor: Colors.brand },
  err: { fontSize: FontSize.xs, color: Colors.brand },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  typeChipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  typeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  typeChipTextActive: { color: Colors.white },
  submitBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
  submitBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
});
