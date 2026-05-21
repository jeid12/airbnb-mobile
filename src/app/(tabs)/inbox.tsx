import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useConversations } from '@/features/messages/hooks/useMessages';
import Spinner from '@/shared/components/Spinner';
import type { ApiMessage } from '@/services/api';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ThreadRow({ message, myId }: { message: ApiMessage; myId: string }) {
  const isMine = message.senderId === myId;
  const peer   = isMine ? message.receiver : message.sender;
  const peerId = isMine ? message.receiverId : message.senderId;
  const isUnread = !message.isRead && !isMine;

  return (
    <Pressable
      style={styles.thread}
      onPress={() => router.push(`/messages/${peerId}` as any)}>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: peer?.avatar ?? 'https://i.pravatar.cc/100' }}
          style={styles.avatar}
          contentFit="cover"
        />
        {isUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.threadContent}>
        <View style={styles.threadRow}>
          <Text style={[styles.threadName, isUnread && styles.bold]}>
            {peer?.name ?? 'User'}
          </Text>
          <Text style={styles.threadTime}>{timeAgo(message.createdAt)}</Text>
        </View>
        <Text style={[styles.threadPreview, isUnread && styles.bold]} numberOfLines={1}>
          {isMine ? 'You: ' : ''}{message.content}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </Pressable>
  );
}

function AuthGate() {
  return (
    <View style={styles.gate}>
      <Ionicons name="chatbubble-ellipses-outline" size={56} color={Colors.border} />
      <Text style={styles.gateTitle}>Your messages</Text>
      <Text style={styles.gateSub}>
        Log in to read and send messages to hosts and guests.
      </Text>
      <Pressable style={styles.gateBtn} onPress={() => router.push('/login')}>
        <Text style={styles.gateBtnText}>Log in</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/register')}>
        <Text style={styles.gateLink}>Create account</Text>
      </Pressable>
    </View>
  );
}

export default function InboxScreen() {
  const { token, user } = useAuth();
  const { data: conversations, isLoading, error, refetch } = useConversations();
  const unread = (conversations ?? []).filter((m) => !m.isRead && m.receiverId === user?.id).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unread}</Text>
          </View>
        )}
      </View>

      {!token ? (
        <AuthGate />
      ) : isLoading ? (
        <Spinner />
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={40} color={Colors.border} />
          <Text style={styles.errText}>{error.message}</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {unread > 0 ? (
            <View style={styles.notifBar}>
              <View style={styles.notifDot} />
              <Text style={styles.notifText}>
                {unread} unread message{unread > 1 ? 's' : ''}
              </Text>
            </View>
          ) : conversations && conversations.length > 0 ? (
            <View style={styles.allClear}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
              <Text style={styles.allClearText}>You're all caught up</Text>
            </View>
          ) : null}

          {!conversations?.length ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubble-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>
                When you contact a host or receive a message, it will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => <ThreadRow message={item} myId={user!.id} />}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              onRefresh={refetch}
              refreshing={isLoading}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, flex: 1 },
  unreadBadge: { backgroundColor: Colors.brand, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  unreadBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700' },
  notifBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10, backgroundColor: '#FFF5F5' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand },
  notifText: { fontSize: FontSize.sm, color: Colors.brand, fontWeight: '600' },
  allClear: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 10, backgroundColor: Colors.backgroundSecondary },
  allClearText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  thread: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.backgroundSecondary },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.brand, borderWidth: 2, borderColor: Colors.white },
  threadContent: { flex: 1, gap: 2 },
  threadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadName: { fontSize: FontSize.base, color: Colors.text },
  threadTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  threadPreview: { fontSize: FontSize.sm, color: Colors.textSecondary },
  bold: { fontWeight: '700', color: Colors.text },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 80 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  errText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.text },
  retryText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  gateTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  gateSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  gateBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.sm },
  gateBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  gateLink: { fontSize: FontSize.base, color: Colors.text, fontWeight: '600', textDecorationLine: 'underline' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  emptySub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
