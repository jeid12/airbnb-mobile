import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface Pref { key: string; label: string; sub: string; value: boolean }

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.brand }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const INITIAL: Pref[] = [
  { key: 'booking_confirm', label: 'Booking confirmations', sub: 'Get notified when a booking is confirmed or cancelled.', value: true },
  { key: 'reminders', label: 'Trip reminders', sub: "Reminders 24 h before check-in and check-out.", value: true },
  { key: 'messages', label: 'Messages', sub: 'Notify me when I receive a new message.', value: true },
  { key: 'promotions', label: 'Promotions & deals', sub: 'Special offers and discounts tailored for you.', value: false },
  { key: 'new_listings', label: 'New listings in saved areas', sub: 'Alerts when new places appear in locations you searched.', value: false },
  { key: 'reviews', label: 'Reviews', sub: 'Get notified when a guest leaves a review.', value: true },
  { key: 'account', label: 'Account activity', sub: 'Security alerts, sign-in notifications.', value: true },
];

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<Pref[]>(INITIAL);

  function toggle(key: string, v: boolean) {
    setPrefs((p) => p.map((r) => (r.key === key ? { ...r, value: v } : r)));
  }

  function save() {
    // Preferences stored locally; a real app would persist to backend or
    // device notification settings.
    Toast.show({ type: 'success', text1: 'Notifications saved' });
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email & push</Text>
          <View style={styles.card}>
            {prefs.map((p, i) => (
              <View key={p.key}>
                <ToggleRow
                  label={p.label}
                  sub={p.sub}
                  value={p.value}
                  onChange={(v) => toggle(p.key, v)}
                />
                {i < prefs.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save preferences</Text>
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
  section: { padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  card: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md },
  rowLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.text },
  rowSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.md },
  saveBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', margin: Spacing.md },
  saveBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
});
