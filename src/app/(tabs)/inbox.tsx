import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { messageThreads } from '@/data/messages';
import type { MessageThread } from '@/features/listings/types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ThreadItem({ thread }: { thread: MessageThread }) {
  const hasUnread = thread.unreadCount > 0;

  return (
    <Pressable style={styles.thread}>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: thread.participant.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        {hasUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.threadContent}>
        <View style={styles.threadRow}>
          <Text style={[styles.threadName, hasUnread && styles.bold]}>
            {thread.participant.name}
          </Text>
          <Text style={styles.threadTime}>{timeAgo(thread.lastMessage.sentAt)}</Text>
        </View>

        {thread.listing && (
          <Text style={styles.threadListing} numberOfLines={1}>
            {thread.listing.title}
          </Text>
        )}

        <Text
          style={[styles.threadPreview, hasUnread && styles.bold]}
          numberOfLines={1}>
          {thread.lastMessage.fromMe ? 'You: ' : ''}
          {thread.lastMessage.body}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function InboxScreen() {
  const totalUnread = messageThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
      </View>

      {/* Notification status */}
      {totalUnread > 0 ? (
        <View style={styles.notifBar}>
          <View style={styles.notifDot} />
          <Text style={styles.notifText}>
            {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
          </Text>
        </View>
      ) : (
        <View style={styles.allCaughtUp}>
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
          <Text style={styles.allCaughtUpText}>You are all caught up</Text>
        </View>
      )}

      {messageThreads.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>
            When you message a host or receive a booking request, it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={messageThreads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ThreadItem thread={item} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },

  notifBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFF5F5',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand,
  },
  notifText: { fontSize: FontSize.sm, color: Colors.brand, fontWeight: '600' },

  allCaughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  allCaughtUpText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  // Thread
  thread: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.backgroundSecondary,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  threadContent: { flex: 1, gap: 2 },
  threadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadName: { fontSize: FontSize.base, color: Colors.text },
  threadTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  threadListing: { fontSize: FontSize.xs, color: Colors.textSecondary },
  threadPreview: { fontSize: FontSize.sm, color: Colors.textSecondary },
  bold: { fontWeight: '700', color: Colors.text },

  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 80 },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
});
