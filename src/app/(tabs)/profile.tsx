import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

interface SettingRow {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
}

function SettingsSection({ title, rows }: { title: string; rows: SettingRow[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {rows.map((row, i) => (
          <View key={row.label}>
            <Pressable
              style={styles.settingRow}
              onPress={row.onPress}
              android_ripple={{ color: Colors.borderLight }}>
              <Ionicons name={row.icon} size={22} color={Colors.text} />
              <Text style={styles.settingLabel}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </Pressable>
            {i < rows.length - 1 && <View style={styles.rowDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Not-logged-in state ──────────────────────────────────────────────────────
function GuestProfile() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.guestCard}>
        <Text style={styles.guestHeading}>Log in to your account</Text>
        <Text style={styles.guestSub}>
          Access your trips, wishlists, and account settings when you log in.
        </Text>
        <Pressable style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>Log in</Text>
        </Pressable>
        <Pressable style={styles.registerBtn} onPress={() => router.push('/register')}>
          <Text style={styles.registerBtnText}>
            Don't have an account? <Text style={{ fontWeight: '700' }}>Sign up</Text>
          </Text>
        </Pressable>
      </View>

      <SettingsSection
        title="Explore"
        rows={[
          { icon: 'help-circle-outline', label: 'How Airbnb works' },
          { icon: 'shield-checkmark-outline', label: 'Safety information' },
          { icon: 'information-circle-outline', label: 'Support' },
        ]}
      />

      <Text style={styles.version}>Airbnb Mobile v1.0</Text>
    </ScrollView>
  );
}

// ─── Logged-in profile ────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <GuestProfile />
    </SafeAreaView>
  );

  const accountSettings: SettingRow[] = [
    { icon: 'person-outline', label: 'Personal information' },
    { icon: 'card-outline', label: 'Payments and payouts' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy and sharing' },
    { icon: 'briefcase-outline', label: 'Travel for work' },
  ];

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  }

  const joinYear = new Date(user.createdAt).getFullYear();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.userCardLeft}>
            <View style={styles.avatarWrap}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} contentFit="cover" />
              ) : (
                <View style={[styles.userAvatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {user.isSuperhost && (
                <View style={styles.superhostDot}>
                  <Ionicons name="medal" size={12} color={Colors.brand} />
                </View>
              )}
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userSub}>Member since {joinYear}</Text>
              {user.isSuperhost && <Text style={styles.superhostLabel}>Superhost</Text>}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text} />
        </View>

        {/* User info row */}
        <View style={styles.userInfoRow}>
          <View style={styles.userInfoItem}>
            <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.userInfoText} numberOfLines={1}>{user.email}</Text>
          </View>
          {user.phone && (
            <View style={styles.userInfoItem}>
              <Ionicons name="call-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.userInfoText}>{user.phone}</Text>
            </View>
          )}
        </View>

        {/* Aircover banner */}
        <Pressable style={styles.aircoverBanner}>
          <View>
            <Text style={styles.aircoverTitle}>
              Get <Text style={styles.aircoverBrand}>air</Text>
              <Text style={styles.aircoverBrandBold}>cover</Text> from your profile
            </Text>
            <Text style={styles.aircoverSub}>
              Every booking includes free protection from host cancellations, listing inaccuracies,
              and other issues. Learn more
            </Text>
          </View>
        </Pressable>

        {/* Account settings */}
        <SettingsSection title="Account Settings" rows={accountSettings} />

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Pressable style={styles.settingRow} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={Colors.brand} />
              <Text style={[styles.settingLabel, { color: Colors.brand }]}>Log out</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.version}>Airbnb Mobile v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },

  // Guest card
  guestCard: {
    margin: Spacing.md, padding: Spacing.lg,
    borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border,
    gap: Spacing.sm, ...Shadow.sm,
  },
  guestHeading: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  guestSub: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  loginBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.lg,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm,
  },
  loginBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  registerBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  registerBtnText: { fontSize: FontSize.base, color: Colors.textSecondary },

  // User card
  userCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg,
  },
  userCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarWrap: { position: 'relative' },
  userAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.backgroundSecondary },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.brand },
  avatarInitial: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  superhostDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  userSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  superhostLabel: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: '600', marginTop: 2 },

  // Info row
  userInfoRow: {
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm,
  },
  userInfoItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  userInfoText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },

  // Aircover
  aircoverBanner: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    padding: Spacing.md, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, ...Shadow.sm,
  },
  aircoverTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  aircoverBrand: { fontStyle: 'italic', fontWeight: '400' },
  aircoverBrandBold: { fontStyle: 'italic', fontWeight: '700' },
  aircoverSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 6, lineHeight: 18 },

  // Sections
  section: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  sectionCard: {
    borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', backgroundColor: Colors.white,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 16, gap: Spacing.md,
  },
  settingLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  rowDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 54 },

  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textLight, paddingBottom: Spacing.xl },
});
