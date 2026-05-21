import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useThread, useSendMessage } from '@/features/messages/hooks/useMessages';
import { api } from '@/services/api';
import Spinner from '@/shared/components/Spinner';
import type { ApiMessage } from '@/services/api';

function Bubble({ message, myId }: { message: ApiMessage; myId: string }) {
  const isMine = message.senderId === myId;
  const time = new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
      {!isMine && (
        <Image
          source={{ uri: message.sender.avatar ?? 'https://i.pravatar.cc/60' }}
          style={styles.bubbleAvatar}
          contentFit="cover"
        />
      )}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{message.content}</Text>
        <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>{time}</Text>
      </View>
    </View>
  );
}

export default function ThreadScreen() {
  const { peerId } = useLocalSearchParams<{ peerId: string }>();
  const { user, token } = useAuth();
  const { data: messages, isLoading } = useThread(peerId ?? '');
  const { send, isPending } = useSendMessage();
  const [text, setText] = useState('');
  const [peerName, setPeerName] = useState('');
  const [peerAvatar, setPeerAvatar] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  // Resolve peer info
  useEffect(() => {
    if (!peerId || !token) return;
    api.getUserById(peerId).then((u) => {
      setPeerName(u.name);
      setPeerAvatar(u.avatar);
    }).catch(() => {});
  }, [peerId, token]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages?.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages?.length]);

  function handleSend() {
    if (!text.trim() || !peerId) return;
    send(peerId, text.trim());
    setText('');
  }

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errText}>Please log in to view messages.</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Image
          source={{ uri: peerAvatar ?? 'https://i.pravatar.cc/60' }}
          style={styles.headerAvatar}
          contentFit="cover"
        />
        <Text style={styles.headerName}>{peerName || 'Loading…'}</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => router.push('/ai/chat' as any)} style={styles.aiBtn}>
          <Ionicons name="sparkles-outline" size={20} color={Colors.brand} />
        </Pressable>
      </View>

      {isLoading ? (
        <Spinner />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}>
          <FlatList
            ref={listRef}
            data={messages ?? []}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <Bubble message={item} myId={user.id} />}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyThread}>
                <Ionicons name="chatbubble-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyThreadText}>No messages yet. Say hello!</Text>
              </View>
            }
          />

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message…"
              placeholderTextColor={Colors.textLight}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <Pressable
              style={[styles.sendBtn, (!text.trim() || isPending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || isPending}>
              {isPending
                ? <ActivityIndicator color={Colors.white} size="small" />
                : <Ionicons name="send" size={18} color={Colors.white} />}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  errText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  loginBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 12 },
  loginBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.base },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary },
  headerName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, flex: 1 },
  aiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff0f3', alignItems: 'center', justifyContent: 'center' },

  messageList: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.lg },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginBottom: Spacing.sm },
  bubbleRowMine: { flexDirection: 'row-reverse' },
  bubbleAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.backgroundSecondary },
  bubble: { maxWidth: '75%', borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 4 },
  bubbleMine: { backgroundColor: Colors.brand, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: Colors.backgroundSecondary, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: FontSize.base, color: Colors.text, lineHeight: 20 },
  bubbleTextMine: { color: Colors.white },
  bubbleTime: { fontSize: FontSize.xs, color: Colors.textSecondary, alignSelf: 'flex-end' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },

  emptyThread: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyThreadText: { fontSize: FontSize.base, color: Colors.textSecondary },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.white },
  input: { flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSize.base, color: Colors.text },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
