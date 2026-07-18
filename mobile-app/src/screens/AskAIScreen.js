// mobile-app/src/screens/AskAIScreen.js
// Simple chat interface — farmers ask questions, answers come from the
// backend's /assistant/ask endpoint (which proxies to Anthropic's Claude API).

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../utils/api';

const C = { primary: '#2D6A4F', light: '#B7E4C7', bg: '#F5FFF9',
            text: '#1B4332', muted: '#6B9080', white: '#FFFFFF',
            error: '#D62828', bubbleUser: '#2D6A4F', bubbleAI: '#FFFFFF' };

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm your farming assistant 🌱 Ask me anything about crops, pests, soil, or livestock, and I'll do my best to help.",
};

export default function AskAIScreen() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/ask', { question });
      const aiMsg = { id: Date.now().toString() + '-a', role: 'assistant', text: res.data.answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now().toString() + '-e',
        role: 'assistant',
        text: "Sorry, I couldn't reach the assistant right now. Please check your connection and try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  function renderItem({ item }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={isUser ? styles.bubbleTextUser : styles.bubbleTextAI}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Icon name="robot-happy-outline" size={22} color={C.primary} />
        <Text style={styles.headerTitle}>Ask AI</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.typingText}>Thinking…</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about crops, pests, soil…"
          placeholderTextColor={C.muted}
          value={input}
          onChangeText={setInput}
          multiline
          onSubmitEditing={send}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || loading}
        >
          <Icon name="send" size={20} color={C.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.bg },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 8,
                    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12 },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: C.text },
  list:           { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  bubbleRow:      { flexDirection: 'row' },
  bubbleRowUser:  { justifyContent: 'flex-end' },
  bubble:         { maxWidth: '82%', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleUser:     { backgroundColor: C.bubbleUser, borderBottomRightRadius: 4 },
  bubbleAI:       { backgroundColor: C.bubbleAI, borderWidth: 1, borderColor: C.light,
                    borderBottomLeftRadius: 4 },
  bubbleTextUser: { color: C.white, fontSize: 14, lineHeight: 20 },
  bubbleTextAI:   { color: C.text, fontSize: 14, lineHeight: 20 },
  typingRow:      { flexDirection: 'row', alignItems: 'center', gap: 8,
                    paddingHorizontal: 20, paddingBottom: 6 },
  typingText:     { fontSize: 12, color: C.muted },
  inputRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10,
                    paddingHorizontal: 14, paddingVertical: 10,
                    borderTopWidth: 1, borderTopColor: C.light, backgroundColor: C.white },
  input:          { flex: 1, backgroundColor: C.bg, borderRadius: 20,
                    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
                    color: C.text, maxHeight: 100, borderWidth: 1, borderColor: C.light },
  sendBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primary,
                    justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled:{ backgroundColor: C.muted },
});