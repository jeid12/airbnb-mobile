import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/user';

interface SettingRow {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
}

const accountSettings: SettingRow[] = [
  { icon: 'person-outline', label: 'Personal information' },
  { icon: 'card-outline', label: 'Payments and payouts' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'shield-checkmark-outline', label: 'Privacy and sharing' },
  { icon: 'briefcase-outline', label: 'Travel for work' },
];

function SettingsSection({ title, rows }: { title: string; rows: SettingRow[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {rows.map((row, i) => (
          <View key={row.label}>
            <Pressable style={styles.settingRow} android_ripple={{ color: Colors.borderLight }}>
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

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.userCardLeft}>
            <Image
              source={{ uri: currentUser.avatar }}
              style={styles.userAvatar}
              contentFit="cover"
            />
            <View>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userSub}>View profile</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text} />
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
            <Pressable style={styles.settingRow}>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },

  // User card
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  userCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundSecondary,
  },
  userName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  userSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  // Aircover
  aircoverBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  aircoverTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  aircoverBrand: { fontStyle: 'italic', fontWeight: '400' },
  aircoverBrandBold: { fontStyle: 'italic', fontWeight: '700' },
  aircoverSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    gap: Spacing.md,
  },
  settingLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  rowDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 54 },

  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textLight,
    paddingBottom: Spacing.xl,
  },
});
