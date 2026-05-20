import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { listingSchema, type ListingFormData } from '@/features/host/schemas/listing';

const TYPES = ['APARTMENT', 'VILLA', 'CABIN', 'HOUSE'] as const;

export default function CreateListingScreen() {
  const qc = useQueryClient();
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: { title: '', description: '', location: '', pricePerNight: 50, type: 'APARTMENT', guests: 2 },
  });

  const selectedType = watch('type');

  async function onSubmit(data: ListingFormData) {
    // In a real app, POST to API. Here we optimistically add to cache.
    await new Promise((r) => setTimeout(r, 600));
    qc.invalidateQueries({ queryKey: ['listings'] });
    Toast.show({ type: 'success', text1: 'Listing created!', text2: data.title });
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>New listing</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Basic Info */}
          <Text style={styles.sectionHeading}>Basic info</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Title</Text>
            <Controller control={control} name="title" render={({ field }) => (
              <TextInput style={[styles.input, errors.title && styles.inputErr]}
                placeholder="Stunning ocean-view villa…" placeholderTextColor={Colors.textLight}
                onChangeText={field.onChange} value={field.value} />
            )} />
            {errors.title && <Text style={styles.err}>{errors.title.message}</Text>}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Description</Text>
            <Controller control={control} name="description" render={({ field }) => (
              <TextInput style={[styles.input, styles.textarea, errors.description && styles.inputErr]}
                placeholder="Describe your place in detail…" placeholderTextColor={Colors.textLight}
                multiline numberOfLines={5} textAlignVertical="top"
                onChangeText={field.onChange} value={field.value} />
            )} />
            {errors.description && <Text style={styles.err}>{errors.description.message}</Text>}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Location</Text>
            <Controller control={control} name="location" render={({ field }) => (
              <TextInput style={[styles.input, errors.location && styles.inputErr]}
                placeholder="Downtown, New York" placeholderTextColor={Colors.textLight}
                onChangeText={field.onChange} value={field.value} />
            )} />
            {errors.location && <Text style={styles.err}>{errors.location.message}</Text>}
          </View>

          {/* Details */}
          <Text style={[styles.sectionHeading, { marginTop: Spacing.lg }]}>Details</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Price per night ($)</Text>
            <Controller control={control} name="pricePerNight" render={({ field }) => (
              <TextInput style={[styles.input, errors.pricePerNight && styles.inputErr]}
                placeholder="50" keyboardType="numeric" placeholderTextColor={Colors.textLight}
                onChangeText={(v) => field.onChange(parseFloat(v) || 0)} value={String(field.value)} />
            )} />
            {errors.pricePerNight && <Text style={styles.err}>{errors.pricePerNight.message}</Text>}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Max guests</Text>
            <Controller control={control} name="guests" render={({ field }) => (
              <TextInput style={[styles.input, errors.guests && styles.inputErr]}
                placeholder="2" keyboardType="numeric" placeholderTextColor={Colors.textLight}
                onChangeText={(v) => field.onChange(parseInt(v, 10) || 1)} value={String(field.value)} />
            )} />
            {errors.guests && <Text style={styles.err}>{errors.guests.message}</Text>}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Property type</Text>
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
            <Text style={styles.submitBtnText}>{isSubmitting ? 'Saving…' : 'Save listing'}</Text>
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
  sectionHeading: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
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
