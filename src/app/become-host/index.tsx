import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

const STEPS = [
  { icon: '🏠', label: 'Choose your property type' },
  { icon: '📍', label: 'Set your location' },
  { icon: '🛏️', label: 'Add rooms & capacity' },
  { icon: '✨', label: 'Pick amenities' },
  { icon: '✏️', label: 'Create your title' },
  { icon: '📝', label: 'Write your description' },
  { icon: '💰', label: 'Set your price' },
];

export default function BecomeHostIntro() {
  const { user } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Ionicons name="person-circle-outline" size={64} color={Colors.border} />
          <Text style={styles.title}>Sign in first</Text>
          <Text style={styles.sub}>You need to be signed in to become a host.</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (user.role === 'HOST' || user.role === 'ADMIN') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>You're already a host!</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.replace('/host')}>
            <Text style={styles.loginBtnText}>Go to Host Dashboard</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBox}>
          <Text style={styles.heroEmoji}>🏡</Text>
          <Text style={styles.heroTitle}>Become an Airbnb Host</Text>
          <Text style={styles.heroSub}>
            Share your space, set your own price, and earn extra income — all on your own terms.
          </Text>
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>It only takes 7 steps</Text>
          {STEPS.map((s, i) => (
            <View key={s.label} style={styles.stepRow}>
              <View style={styles.stepNumWrap}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              <Text style={styles.stepEmoji}>{s.icon}</Text>
              <Text style={styles.stepLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.featuresRow}>
          {[
            { icon: 'shield-checkmark-outline', label: 'AirCover protection' },
            { icon: 'cash-outline', label: 'You set the price' },
            { icon: 'time-outline', label: 'Host on your schedule' },
          ].map((f) => (
            <View key={f.label} style={styles.featureItem}>
              <Ionicons name={f.icon as any} size={24} color={Colors.brand} />
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.startBtn} onPress={() => router.push('/become-host/type')}>
          <Text style={styles.startBtnText}>Get started</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  emoji: { fontSize: 64 },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  sub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  loginBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.sm },
  loginBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.base },
  heroBox: { alignItems: 'center', paddingTop: Spacing.md, gap: Spacing.md },
  heroEmoji: { fontSize: 64 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  heroSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  stepsCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.md },
  stepsTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepNumWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  stepEmoji: { fontSize: 18 },
  stepLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-around' },
  featureItem: { alignItems: 'center', gap: 6, flex: 1 },
  featureLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  startBtn: { backgroundColor: Colors.brand, borderRadius: Radius.xl, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  startBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
