import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

// Simulated user list (in a real app, fetched from GET /admin/users)
interface AdminUser { id: string; name: string; email: string; role: string; banned: boolean; createdAt: string }

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'GUEST', banned: false, createdAt: '2025-01-15' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'HOST', banned: false, createdAt: '2025-02-20' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'HOST', banned: true, createdAt: '2025-03-10' },
  { id: '4', name: 'Dave Brown', email: 'dave@example.com', role: 'GUEST', banned: false, createdAt: '2025-04-05' },
];

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  GUEST: { bg: '#eff6ff', text: '#1d4ed8' },
  HOST: { bg: '#f0fdf4', text: '#15803d' },
  ADMIN: { bg: '#fdf4ff', text: '#7e22ce' },
};

function UserRow({ user, onToggleBan }: { user: AdminUser; onToggleBan: () => void }) {
  const rc = ROLE_COLORS[user.role] ?? { bg: '#f3f4f6', text: '#374151' };
  return (
    <View style={styles.userRow}>
      <View style={styles.userAvatar}>
        <Text style={styles.userInitial}>{user.name[0]?.toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
            <Text style={[styles.roleText, { color: rc.text }]}>{user.role}</Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userMeta}>Joined {user.createdAt}</Text>
      </View>
      <Pressable
        style={[styles.banBtn, user.banned && styles.unbanBtn]}
        onPress={onToggleBan}
      >
        <Text style={[styles.banText, user.banned && styles.unbanText]}>
          {user.banned ? 'Unban' : 'Ban'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function UsersScreen() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [users, setUsers] = useState(MOCK_USERS);

  const toggleBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const next = { ...u, banned: !u.banned };
        Alert.alert(next.banned ? 'User banned' : 'User unbanned', next.name);
        return next;
      }),
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.count}>{users.length} total</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email…"
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Role filter */}
      <View style={styles.filterRow}>
        {['All', 'GUEST', 'HOST', 'ADMIN'].map((r) => (
          <Pressable key={r} style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
            onPress={() => setRoleFilter(r)}>
            <Text style={[styles.filterText, roleFilter === r && styles.filterTextActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => <UserRow user={item} onToggleBan={() => toggleBan(item.id)} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No users found.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  count: { fontSize: FontSize.sm, color: Colors.textSecondary },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, margin: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  separator: { height: 1, backgroundColor: Colors.borderLight },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  userInitial: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  userName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  userEmail: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  userMeta: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 1 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  roleText: { fontSize: FontSize.xs, fontWeight: '600' },
  banBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: '#ef4444' },
  unbanBtn: { borderColor: Colors.success },
  banText: { fontSize: FontSize.xs, fontWeight: '600', color: '#ef4444' },
  unbanText: { color: Colors.success },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
