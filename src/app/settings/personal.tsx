import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
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
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().min(7, 'Phone must be at least 7 characters'),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
});

type FormData = z.infer<typeof schema>;

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errText}>{error}</Text> : null}
    </View>
  );
}

export default function PersonalInfoScreen() {
  const { user, updateProfile } = useAuth();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', username: '', phone: '', bio: '' },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        username: user.username ?? '',
        phone: user.phone ?? '',
        bio: user.bio ?? '',
      });
    }
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    try {
      await updateProfile({
        name: data.name,
        username: data.username,
        phone: data.phone,
        bio: data.bio ?? null,
      });
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      router.back();
    } catch (e: any) {
      Alert.alert('Update failed', e.message ?? 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Personal information</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Read-only email */}
          <FieldWrap label="Email address">
            <View style={[styles.input, styles.readOnly]}>
              <Text style={styles.readOnlyText}>{user?.email}</Text>
            </View>
            <Text style={styles.hint}>Email cannot be changed.</Text>
          </FieldWrap>

          <FieldWrap label="Full name" error={errors.name?.message}>
            <Controller control={control} name="name" render={({ field }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputErr]}
                value={field.value} onChangeText={field.onChange}
                placeholder="Your full name" placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
              />
            )} />
          </FieldWrap>

          <FieldWrap label="Username" error={errors.username?.message}>
            <Controller control={control} name="username" render={({ field }) => (
              <TextInput
                style={[styles.input, errors.username && styles.inputErr]}
                value={field.value} onChangeText={field.onChange}
                placeholder="yourhandle" placeholderTextColor={Colors.textLight}
                autoCapitalize="none" autoCorrect={false}
              />
            )} />
          </FieldWrap>

          <FieldWrap label="Phone number" error={errors.phone?.message}>
            <Controller control={control} name="phone" render={({ field }) => (
              <TextInput
                style={[styles.input, errors.phone && styles.inputErr]}
                value={field.value} onChangeText={field.onChange}
                placeholder="+1 555 0000" placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
              />
            )} />
          </FieldWrap>

          <FieldWrap label="Bio (optional)" error={errors.bio?.message}>
            <Controller control={control} name="bio" render={({ field }) => (
              <TextInput
                style={[styles.input, styles.textarea, errors.bio && styles.inputErr]}
                value={field.value} onChangeText={field.onChange}
                placeholder="Tell guests a little about yourself…"
                placeholderTextColor={Colors.textLight}
                multiline numberOfLines={4} textAlignVertical="top"
              />
            )} />
          </FieldWrap>

          <Pressable
            style={[styles.saveBtn, (!isDirty || isSubmitting) && styles.saveBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}>
            {isSubmitting
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save changes</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  scroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 48 },
  fieldWrap: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.base, color: Colors.text, backgroundColor: Colors.white,
  },
  textarea: { height: 100 },
  inputErr: { borderColor: Colors.brand },
  errText: { fontSize: FontSize.xs, color: Colors.brand },
  readOnly: { backgroundColor: Colors.backgroundSecondary },
  readOnlyText: { fontSize: FontSize.base, color: Colors.textSecondary },
  hint: { fontSize: FontSize.xs, color: Colors.textLight },
  saveBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
});
