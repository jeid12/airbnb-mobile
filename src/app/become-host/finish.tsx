import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import { api } from '@/services/api';

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function StepFinish() {
  const { draft, reset } = useBecomeHost();
  const { becomeHost, token, user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function publish() {
    setLoading(true);
    try {
      // 1. Upgrade to HOST if still a GUEST — backend returns a new JWT with role:"HOST"
      let hostToken = token!;
      if (user?.role !== 'HOST' && user?.role !== 'ADMIN') {
        const res = await api.becomeHost(token!);
        hostToken = res.token;
        // Also update the auth context so the UI reflects the new role immediately
        await becomeHost();
      }

      // 2. Create the first listing using the HOST-scoped token
      await api.createListing(hostToken, {
        title: draft.title,
        description: draft.description,
        location: draft.location,
        pricePerNight: draft.pricePerNight,
        guests: draft.guests,
        type: draft.type,
        amenities: draft.amenities,
      });

      reset();
      Toast.show({ type: 'success', text1: '🎉 Welcome, Host!', text2: 'Your listing is live.' });
      router.replace('/host');
    } catch (e: any) {
      Alert.alert('Publish failed', e.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Review & publish</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.celebrateBox}>
            <Text style={styles.celebrateEmoji}>🎉</Text>
            <Text style={styles.celebrateTitle}>Almost there!</Text>
            <Text style={styles.celebrateSub}>Review your listing before going live.</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your listing summary</Text>
            <SummaryRow label="Type" value={draft.type} />
            <SummaryRow label="Location" value={draft.location} />
            <SummaryRow label="Capacity" value={`${draft.guests} guests · ${draft.bedrooms} bed${draft.bedrooms !== 1 ? 's' : ''} · ${draft.bathrooms} bath${draft.bathrooms !== 1 ? 's' : ''}`} />
            <SummaryRow label="Amenities" value={draft.amenities.slice(0, 5).join(', ') + (draft.amenities.length > 5 ? ` +${draft.amenities.length - 5} more` : '')} />
            <SummaryRow label="Title" value={draft.title} />
            <SummaryRow label="Price" value={`$${draft.pricePerNight} / night`} />
          </View>

          {user?.role === 'GUEST' && (
            <View style={styles.upgradeNotice}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.brand} />
              <Text style={styles.upgradeText}>
                Your account will be upgraded to <Text style={{ fontWeight: '700' }}>Host</Text> when you publish.
              </Text>
            </View>
          )}

          <View style={styles.termsBox}>
            <Text style={styles.termsText}>
              By publishing you agree to Airbnb's{' '}
              <Text style={{ textDecorationLine: 'underline' }}>Host Terms of Service</Text> and{' '}
              <Text style={{ textDecorationLine: 'underline' }}>Non-discrimination Policy</Text>.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.publishBtn, loading && { opacity: 0.7 }]} onPress={publish} disabled={loading}>
          {loading
            ? <Text style={styles.publishBtnText}>Publishing…</Text>
            : <>
                <Text style={styles.publishBtnText}>Publish listing</Text>
                <Ionicons name="rocket-outline" size={18} color={Colors.white} />
              </>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 20 },
  celebrateBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  celebrateEmoji: { fontSize: 56 },
  celebrateTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  celebrateSub: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  summaryTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 80 },
  summaryValue: { flex: 1, fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, textAlign: 'right' },
  upgradeNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: '#fff0f3', borderRadius: Radius.xl, padding: Spacing.md },
  upgradeText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  termsBox: { paddingHorizontal: Spacing.sm },
  termsText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  footer: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  publishBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  publishBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
