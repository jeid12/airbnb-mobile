import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', username: '', phone: '', password: '' });

  function set(key: keyof typeof form) {
    return (val: string) => setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleRegister() {
    const { name, email, username, phone, password } = form;
    if (!name.trim() || !email.trim() || !username.trim() || !phone.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), username: username.trim(), phone: phone.trim(), password });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Registration failed', e.message ?? 'Please try again.');
    }
  }

  const fields: Array<{
    key: keyof typeof form;
    label: string;
    placeholder: string;
    keyboard?: 'default' | 'email-address' | 'phone-pad';
    secure?: boolean;
    capitalize?: 'none' | 'words';
  }> = [
    { key: 'name', label: 'Full name', placeholder: 'Jane Doe', capitalize: 'words' },
    { key: 'email', label: 'Email', placeholder: 'you@example.com', keyboard: 'email-address' },
    { key: 'username', label: 'Username', placeholder: 'janedoe123' },
    { key: 'phone', label: 'Phone', placeholder: '+1-555-0000', keyboard: 'phone-pad' },
    { key: 'password', label: 'Password', placeholder: '8+ characters', secure: true },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </Pressable>

          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.sub}>Join Airbnb and start exploring</Text>

          <View style={styles.form}>
            {fields.map((f) => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key]}
                  onChangeText={set(f.key)}
                  keyboardType={f.keyboard ?? 'default'}
                  autoCapitalize={f.capitalize ?? 'none'}
                  autoCorrect={false}
                  secureTextEntry={f.secure}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            ))}

            <Pressable
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Create account</Text>
              )}
            </Pressable>

            <Pressable style={styles.switchBtn} onPress={() => router.replace('/login')}>
              <Text style={styles.switchText}>
                Already have an account?{'  '}
                <Text style={styles.switchLink}>Log in</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },

  closeBtn: { alignSelf: 'flex-start', marginBottom: Spacing.xl, padding: 4 },

  heading: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  sub: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.xl },

  form: { gap: Spacing.md },
  fieldWrap: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSize.base,
    color: Colors.text,
    backgroundColor: Colors.white,
  },

  btn: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },

  switchBtn: { alignItems: 'center' },
  switchText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  switchLink: { color: Colors.text, fontWeight: '700', textDecorationLine: 'underline' },
});
