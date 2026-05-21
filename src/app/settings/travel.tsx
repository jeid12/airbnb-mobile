import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

export default function TravelForWorkScreen() {
  const [enabled, setEnabled] = useState(false);
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');

  function save() {
    Toast.show({ type: 'success', text1: 'Work travel settings saved' });
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Travel for work</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Info banner */}
        <View style={styles.banner}>
          <Ionicons name="briefcase-outline" size={28} color={Colors.brand} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Business travel mode</Text>
            <Text style={styles.bannerSub}>
              Get VAT receipts, toggle billing to your company, and filter listings suited for business travellers.
            </Text>
          </View>
        </View>

        {/* Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Enable work travel</Text>
              <Text style={styles.toggleSub}>Activate business mode for all future bookings.</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: Colors.border, true: Colors.brand }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {enabled && (
          <>
            <Text style={styles.sectionTitle}>Company details</Text>
            <View style={styles.card}>
              {[
                { label: 'Company name', val: company, set: setCompany, placeholder: 'Acme Corp' },
                { label: 'Work email', val: email, set: setEmail, placeholder: 'you@acme.com', keyboard: 'email-address' as const },
                { label: 'VAT / Tax ID (optional)', val: taxId, set: setTaxId, placeholder: 'GB123456789' },
              ].map((f, i, arr) => (
                <View key={f.label}>
                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <TextInput
                      style={styles.input}
                      value={f.val}
                      onChangeText={f.set}
                      placeholder={f.placeholder}
                      placeholderTextColor={Colors.textLight}
                      keyboardType={f.keyboard ?? 'default'}
                      autoCapitalize="none"
                    />
                  </View>
                  {i < arr.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>

            <View style={styles.receiptCard}>
              <Ionicons name="receipt-outline" size={20} color={Colors.brand} />
              <Text style={styles.receiptText}>
                VAT receipts will be automatically attached to your booking confirmation emails.
              </Text>
            </View>
          </>
        )}

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 48 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: '#fff0f3', borderRadius: Radius.xl, padding: Spacing.md },
  bannerTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  bannerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  card: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  toggleLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  toggleSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldWrap: { padding: Spacing.md, gap: 6 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.base, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  receiptCard: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'flex-start' },
  receiptText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  saveBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
  saveBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
});
