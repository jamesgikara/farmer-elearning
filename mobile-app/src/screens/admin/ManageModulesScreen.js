// mobile-app/src/screens/admin/ManageModulesScreen.js

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../utils/api';

const C = { primary: '#2D6A4F', light: '#B7E4C7', bg: '#F5FFF9',
            text: '#1B4332', muted: '#6B9080', white: '#FFFFFF',
            error: '#D62828' };

export default function ManageModulesScreen() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/modules')
        .then(r => setModules(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const togglePublish = async (mod) => {
    await api.put(`/modules/${mod.module_id}`, { is_published: !mod.is_published });
    setModules(prev => prev.map(m =>
      m.module_id === mod.module_id ? { ...m, is_published: !m.is_published } : m
    ));
  };

  const deleteModule = (id) => {
    Alert.alert('Delete module', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/modules/${id}`).catch(() => {});
          setModules(prev => prev.filter(m => m.module_id !== id));
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Modules</Text>
      <FlatList
        data={modules}
        keyExtractor={m => String(m.module_id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.catTag}>{item.category || '—'}</Text>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.meta}>{item.content_type}  ·  {item.duration_mins || '—'} min</Text>
            </View>
            <View style={styles.cardRight}>
              <Switch
                value={!!item.is_published}
                onValueChange={() => togglePublish(item)}
                trackColor={{ false: '#ccc', true: C.light }}
                thumbColor={item.is_published ? C.primary : '#999'}
              />
              <Text style={styles.switchLabel}>
                {item.is_published ? 'Live' : 'Draft'}
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteModule(item.module_id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No modules found. Upload one in the Upload tab.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading:   { fontSize: 22, fontWeight: '700', color: C.text,
               paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
  list:      { paddingHorizontal: 20, paddingBottom: 80 },
  card:      { backgroundColor: C.white, borderRadius: 12, flexDirection: 'row',
               marginBottom: 10, padding: 14, elevation: 2,
               shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  cardLeft:  { flex: 1 },
  cardRight: { alignItems: 'center', gap: 4, paddingLeft: 12 },
  catTag:    { fontSize: 11, fontWeight: '700', color: C.primary,
               backgroundColor: C.light, alignSelf: 'flex-start',
               paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  title:     { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 4 },
  meta:      { fontSize: 12, color: C.muted },
  switchLabel:{ fontSize: 10, color: C.muted },
  deleteBtn: { marginTop: 6, paddingVertical: 4, paddingHorizontal: 8,
               borderRadius: 6, borderWidth: 1, borderColor: C.error },
  deleteText:{ fontSize: 11, color: C.error, fontWeight: '600' },
  empty:     { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 14 },
});
