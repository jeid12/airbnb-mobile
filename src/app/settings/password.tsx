import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { api } from '@/services/api';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function PasswordField({
  label, value, onChange, show, onToggle, error, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; error?: string; placeholder?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.passRow, error && styles.passRowErr]}>
        <TextInput
          style={styles.passInput}
          value={value} onChangeText={onChange}
          secureTextEntry={!show}
          placeholder={placeholder ?? '••••••••'}
          placeholderTextColor={Colors.textLight}
        />
        <Pressable onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>
      {error ? <Text style={styles.errText}>{error}</Text> : null}
    </View>
  );
}

export default function ChangePasswordScreen() {
  const { token } = useAuth();
  const [show, setShow] = useState({ curr: false, next: false, conf: false });
  const toggle = (k: keyof typeof show) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!token) { Alert.alert('Error', 'You must be logged in.'); return; }
    try {
      await api.changePassword(token, data.currentPassword, data.newPassword);
      Toast.show({ type: 'success', text1: 'Password changed!', text2: 'Your password has been updated.' });
      reset();
      router.back();
    } catch (e: any) {
      Alert.alert('Change failed', e.message ?? 'Please check your current password and try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Change password</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBox}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.brand} />
            <Text style={styles.infoText}>
              Choose a strong password with at least 8 characters. You will remain logged in after changing.
            </Text>
          </View>

          <Controller control={control} name="currentPassword" render={({ field }) => (
            <PasswordField
              label="Current password"
              value={field.value ?? ''} onChange={field.onChange}
              show={show.curr} onToggle={() => toggle('curr')}
              error={errors.currentPassword?.message}
            />
          )} />

          <Controller control={control} name="newPassword" render={({ field }) => (
            <PasswordField
              label="New password"
              placeholder="At least 8 characters"
              value={field.value ?? ''} onChange={field.onChange}
              show={show.next} onToggle={() => toggle('next')}
              error={errors.newPassword?.message}
            />
          )} />

          <Controller control={control} name="confirmPassword" render={({ field }) => (
            <PasswordField
              label="Confirm new password"
              value={field.value ?? ''} onChange={field.onChange}
              show={show.conf} onToggle={() => toggle('conf')}
              error={errors.confirmPassword?.message}
            />
          )} />

          <Pressable
            style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}>
            {isSubmitting
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.saveBtnText}>Update password</Text>}
          </Pressable>

          <Pressable style={styles.forgotBtn} onPress={() => router.push('/settings/forgot-password' as any)}>
            <Text style={styles.forgotText}>Forgot your current password?</Text>
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
  scroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 48 },
  infoBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#fff0f3', borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  fieldWrap: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  passRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, backgroundColor: Colors.white },
  passRowErr: { borderColor: Colors.brand },
  passInput: { flex: 1, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: FontSize.base, color: Colors.text },
  eyeBtn: { paddingHorizontal: Spacing.md, paddingVertical: 14 },
  errText: { fontSize: FontSize.xs, color: Colors.brand },
  saveBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  forgotBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  forgotText: { fontSize: FontSize.sm, color: Colors.textSecondary, textDecorationLine: 'underline' },
});
