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
  sub?: string;
  route?: string;
  onPress?: () => void;
  danger?: boolean;
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
              onPress={row.onPress ?? (() => row.route && router.push(row.route as any))}
              android_ripple={{ color: Colors.borderLight }}>
              <View style={[styles.iconBox, row.danger && styles.iconBoxDanger]}>
                <Ionicons name={row.icon} size={20} color={row.danger ? '#ef4444' : Colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, row.danger && { color: '#ef4444' }]}>{row.label}</Text>
                {row.sub && <Text style={styles.settingSub}>{row.sub}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
            {i < rows.length - 1 && <View style={styles.rowDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Not logged in ────────────────────────────────────────────────────────────
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
          { icon: 'help-circle-outline', label: 'How Airbnb works', sub: 'Learn about hosting and staying' },
          { icon: 'shield-checkmark-outline', label: 'Safety information' },
        ]}
      />
      <Text style={styles.version}>Airbnb Mobile v1.0</Text>
    </ScrollView>
  );
}

// ─── Logged-in profile ────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <GuestProfile />
      </SafeAreaView>
    );
  }

  const joinYear = new Date(user.createdAt).getFullYear();
  const isHost  = user.role === 'HOST';
  const isAdmin = user.role === 'ADMIN';

  const accountSettings: SettingRow[] = [
    { icon: 'person-outline',           label: 'Personal information',  sub: 'Name, username, phone, bio',       route: '/settings/personal' },
    { icon: 'card-outline',             label: 'Payments and payouts',  sub: 'Add cards, view transactions',      route: '/settings/payments' },
    { icon: 'notifications-outline',    label: 'Notifications',         sub: 'Bookings, messages, promotions',    route: '/settings/notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy and sharing',   sub: 'Data usage, account deletion',      route: '/settings/privacy' },
    { icon: 'briefcase-outline',        label: 'Travel for work',       sub: 'Business mode, VAT receipts',       route: '/settings/travel' },
    { icon: 'lock-closed-outline',      label: 'Change password',       sub: 'Update your account password',      route: '/settings/password' },
  ];

  const hostRows: SettingRow[] = [
    ...(isHost || isAdmin
      ? [{ icon: 'home-outline' as const, label: 'Host dashboard', sub: 'Manage listings and bookings', route: '/host' }]
      : []),
    ...(isAdmin
      ? [{ icon: 'settings-outline' as const, label: 'Admin panel', sub: 'Platform management', route: '/admin' }]
      : []),
  ];

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User card — tapping goes to Personal Info */}
        <Pressable style={styles.userCard} onPress={() => router.push('/settings/personal')}>
          <View style={styles.avatarWrap}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.userAvatar} contentFit="cover" />
            ) : (
              <View style={[styles.userAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            {user.isSuperhost && (
              <View style={styles.superhostDot}>
                <Ionicons name="medal" size={10} color={Colors.brand} />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userSub}>
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()} · Member since {joinYear}
            </Text>
            {user.isSuperhost && (
              <View style={styles.superhostBadge}>
                <Ionicons name="medal-outline" size={12} color={Colors.brand} />
                <Text style={styles.superhostText}>Superhost</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text} />
        </Pressable>

        {/* Quick info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{user.email}</Text>
          </View>
          {user.phone ? (
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* Aircover banner */}
        <Pressable style={styles.aircoverBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.aircoverTitle}>
              Get <Text style={{ fontStyle: 'italic' }}>air</Text>
              <Text style={{ fontStyle: 'italic', fontWeight: '700' }}>cover</Text> protection
            </Text>
            <Text style={styles.aircoverSub}>
              Every booking includes free protection from host cancellations and listing inaccuracies.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </Pressable>

        {/* Hosting / Admin */}
        {hostRows.length > 0 && (
          <SettingsSection title="Hosting" rows={hostRows} />
        )}

        {/* Account settings — all wired to real screens */}
        <SettingsSection title="Account settings" rows={accountSettings} />

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Pressable style={styles.settingRow} onPress={handleLogout}>
              <View style={[styles.iconBox, { backgroundColor: '#fff0f3' }]}>
                <Ionicons name="log-out-outline" size={20} color={Colors.brand} />
              </View>
              <Text style={[styles.settingLabel, { color: Colors.brand }]}>Log out</Text>
              <View style={{ flex: 1 }} />
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
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },

  // Guest
  guestCard: { margin: Spacing.md, padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm, ...Shadow.sm },
  guestHeading: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  guestSub: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  loginBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm },
  loginBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  registerBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  registerBtnText: { fontSize: FontSize.base, color: Colors.textSecondary },

  // User card
  userCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg, gap: Spacing.md },
  avatarWrap: { position: 'relative' },
  userAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.backgroundSecondary },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.brand },
  avatarInitial: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.white },
  superhostDot: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  userSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  superhostBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 6 },
  superhostText: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: '600' },

  // Info row
  infoRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },

  // Aircover
  aircoverBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.md, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, gap: Spacing.sm, ...Shadow.sm },
  aircoverTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  aircoverSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, lineHeight: 16 },

  // Sections
  section: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  sectionCard: { borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', backgroundColor: Colors.white },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, gap: Spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  iconBoxDanger: { backgroundColor: '#fff0f0' },
  settingLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.text },
  settingSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 64 },

  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textLight, paddingBottom: Spacing.xl, paddingTop: Spacing.sm },
});
