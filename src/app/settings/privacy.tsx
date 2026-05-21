import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

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

function ActionRow({ label, sub, danger, onPress }: { label: string; sub: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: '#ef4444' }]}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function PrivacyScreen() {
  const { logout } = useAuth();
  const [prefs, setPrefs] = useState({
    showProfile: true,
    dataAnalytics: false,
    locationTracking: false,
    personalizedAds: false,
  });

  function toggle(k: keyof typeof prefs, v: boolean) {
    setPrefs((p) => ({ ...p, [k]: v }));
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: () => {
            // In production: call DELETE /users/:id then logout
            logout();
            Toast.show({ type: 'info', text1: 'Account deleted' });
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Privacy & sharing</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile visibility</Text>
          <View style={styles.card}>
            <ToggleRow
              label="Show profile to guests"
              sub="Guests and hosts can see your profile photo and first name."
              value={prefs.showProfile}
              onChange={(v) => toggle('showProfile', v)}
            />
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data usage</Text>
          <View style={styles.card}>
            <ToggleRow
              label="Analytics & improvements"
              sub="Help us improve the app by sharing anonymous usage data."
              value={prefs.dataAnalytics}
              onChange={(v) => toggle('dataAnalytics', v)}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Location services"
              sub="Allow location access to show nearby listings."
              value={prefs.locationTracking}
              onChange={(v) => toggle('locationTracking', v)}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Personalised ads"
              sub="Allow us to use your data to show relevant ads."
              value={prefs.personalizedAds}
              onChange={(v) => toggle('personalizedAds', v)}
            />
          </View>
        </View>

        {/* Account actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <ActionRow
              label="Download my data"
              sub="Request a copy of all data we hold about you."
              onPress={() => Toast.show({ type: 'info', text1: 'Your data export will be emailed to you.' })}
            />
            <View style={styles.divider} />
            <ActionRow
              label="Delete my account"
              sub="Permanently remove your account and all associated data."
              danger
              onPress={handleDeleteAccount}
            />
          </View>
        </View>

        <Pressable
          style={styles.saveBtn}
          onPress={() => { Toast.show({ type: 'success', text1: 'Privacy settings saved' }); router.back(); }}>
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
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  card: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md },
  rowLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.text },
  rowSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.md },
  saveBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', margin: Spacing.md },
  saveBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
});
