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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuid } from 'uuid';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { api } from '@/services/api';

// We use uuid but it may not be installed — fall back to timestamp
function genId() {
  try { return uuid(); } catch { return `${Date.now()}-${Math.random()}`; }
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'What are the best listings in New York?',
  'Find me a cabin under $200 for 4 guests',
  'What amenities should I look for?',
  'How does cancellation work?',
  'Recommend a beachfront villa',
];

const LOGO_SRC = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=60';

export default function AiChatScreen() {
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();
  const [sessionId] = useState(() => genId());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      text: listingId
        ? `Hi! I can answer questions about this listing or help you find similar properties. What would you like to know?`
        : `Hi! I'm your Airbnb AI assistant. I can help you find the perfect stay, answer questions about listings, or give travel recommendations. How can I help?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { id: genId(), role: 'user', text: content, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.aiChat(sessionId, content, listingId);
      const aiMsg: ChatMessage = { id: genId(), role: 'assistant', text: res.reply, timestamp: new Date() };
      setMessages((m) => [...m, aiMsg]);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: genId(), role: 'assistant',
        text: e.message?.includes('429')
          ? 'The AI service is busy right now. Please try again in a moment.'
          : 'Sorry, I couldn\'t respond. Please try again.',
        timestamp: new Date(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function renderItem({ item }: { item: ChatMessage }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color={Colors.brand} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
          <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color={Colors.brand} />
          </View>
          <View>
            <Text style={styles.headerName}>Airbnb AI</Text>
            <Text style={styles.headerSub}>Powered by AI</Text>
          </View>
        </View>
        <Pressable style={styles.clearBtn} onPress={() => setMessages([{
          id: genId(), role: 'assistant', text: 'Chat cleared. How can I help you?', timestamp: new Date(),
        }])}>
          <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={[styles.msgRow]}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color={Colors.brand} />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={Colors.brand} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Suggestions — shown only at start */}
        {messages.length <= 1 && !loading && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} style={styles.suggestion} onPress={() => send(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about your stay…"
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send()}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || loading}>
            {loading
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Ionicons name="send" size={16} color={Colors.white} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  clearBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff0f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffd6e0' },

  messageList: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.md },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginBottom: Spacing.sm },
  msgRowUser: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '80%', borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 4 },
  bubbleAi: { backgroundColor: Colors.backgroundSecondary, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.brand, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },
  bubbleTextUser: { color: Colors.white },
  bubbleTime: { fontSize: FontSize.xs, color: Colors.textSecondary, alignSelf: 'flex-end' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.65)' },
  typingBubble: { backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomLeftRadius: 4 },

  suggestionsRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  suggestion: { backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, borderWidth: 1, borderColor: Colors.borderLight },
  suggestionText: { fontSize: FontSize.sm, color: Colors.text },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.white },
  input: { flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSize.base, color: Colors.text },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
