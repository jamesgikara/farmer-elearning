// mobile-app/src/screens/admin/UploadModuleScreen.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Switch, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../../utils/api';

const C = { primary: '#2D6A4F', light: '#B7E4C7', bg: '#F5FFF9',
            text: '#1B4332', muted: '#6B9080', white: '#FFFFFF',
            error: '#D62828' };

const CONTENT_TYPES = ['video', 'text', 'image'];

export default function UploadModuleScreen() {
  const [categories, setCategories] = useState([]);
  const [form,        setForm]       = useState({
    title: '', description: '', category_id: '',
    content_type: 'video', file_url: '', thumbnail_url: '',
    duration_mins: '', is_published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category_id) {
      setError('Title and category are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/modules', {
        ...form,
        duration_mins: form.duration_mins ? parseInt(form.duration_mins) : null,
        category_id:   parseInt(form.category_id),
      });
      Alert.alert('', 'Module uploaded successfully! 🎉');
      setForm({
        title: '', description: '', category_id: '',
        content_type: 'video', file_url: '', thumbnail_url: '',
        duration_mins: '', is_published: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Upload New Module</Text>

        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={form.title}
          onChangeText={set('title')} placeholder="e.g. Introduction to Maize Farming"
          placeholderTextColor={C.muted} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]}
          value={form.description} onChangeText={set('description')}
          placeholder="Brief description of the module…"
          placeholderTextColor={C.muted} multiline textAlignVertical="top" />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.pillRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.category_id}
              style={[styles.pill,
                String(form.category_id) === String(cat.category_id) && styles.pillActive]}
              onPress={() => set('category_id')(String(cat.category_id))}
            >
              <Text style={[styles.pillText,
                String(form.category_id) === String(cat.category_id) && styles.pillTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Content type</Text>
        <View style={styles.pillRow}>
          {CONTENT_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.pill, form.content_type === t && styles.pillActive]}
              onPress={() => set('content_type')(t)}
            >
              <Text style={[styles.pillText, form.content_type === t && styles.pillTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>File URL (Cloudinary / external)</Text>
        <TextInput style={styles.input} value={form.file_url}
          onChangeText={set('file_url')} placeholder="https://…"
          placeholderTextColor={C.muted} autoCapitalize="none" />

        <Text style={styles.label}>Thumbnail URL</Text>
        <TextInput style={styles.input} value={form.thumbnail_url}
          onChangeText={set('thumbnail_url')} placeholder="https://…"
          placeholderTextColor={C.muted} autoCapitalize="none" />

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput style={styles.input} value={form.duration_mins}
          onChangeText={set('duration_mins')} placeholder="e.g. 12"
          placeholderTextColor={C.muted} keyboardType="numeric" />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Publish immediately</Text>
          <Switch
            value={form.is_published}
            onValueChange={set('is_published')}
            trackColor={{ false: '#ccc', true: C.light }}
            thumbColor={form.is_published ? C.primary : '#999'}
          />
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={C.white} />
            : <Text style={styles.btnText}>Upload Module</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  content:     { padding: 20, paddingTop: 54, paddingBottom: 80 },
  heading:     { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 24 },
  label:       { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input:       { borderWidth: 1.5, borderColor: C.light, borderRadius: 10,
                 paddingHorizontal: 14, paddingVertical: 12,
                 fontSize: 15, color: C.text, marginBottom: 18, backgroundColor: C.white },
  textarea:    { height: 90 },
  pillRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  pill:        { borderWidth: 1.5, borderColor: C.light, borderRadius: 20,
                 paddingHorizontal: 14, paddingVertical: 6 },
  pillActive:  { backgroundColor: C.primary, borderColor: C.primary },
  pillText:    { fontSize: 13, color: C.muted, fontWeight: '500' },
  pillTextActive:{ color: C.white, fontWeight: '700' },
  switchRow:   { flexDirection: 'row', justifyContent: 'space-between',
                 alignItems: 'center', marginBottom: 18 },
  error:       { color: C.error, fontSize: 13, marginBottom: 12 },
  btn:         { backgroundColor: C.primary, borderRadius: 10,
                 paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText:     { color: C.white, fontSize: 16, fontWeight: '700' },
});
