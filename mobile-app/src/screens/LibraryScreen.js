// mobile-app/src/screens/LibraryScreen.js
// Offline-cached modules (available without internet)

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getOfflineModules, removeOfflineModule } from '../utils/offlineStorage';

const C = { primary: '#2D6A4F', light: '#B7E4C7', bg: '#F5FFF9',
            text: '#1B4332', muted: '#6B9080', white: '#FFFFFF' };

export default function LibraryScreen({ navigation }) {
  const [modules, setModules] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getOfflineModules().then(setModules);
    }, [])
  );

  const handleRemove = async (id) => {
    await removeOfflineModule(id);
    setModules(prev => prev.filter(m => m.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Offline Library</Text>
      <Text style={styles.sub}>Modules available without internet</Text>

      <FlatList
        data={modules}
        keyExtractor={m => String(m.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardBody}
              onPress={() => navigation.navigate('Module', { module: { ...item, module_id: item.id } })}
            >
              <Text style={styles.catTag}>{item.category || 'Uncategorised'}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.content_type}  ·  Saved {new Date(item.saved_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item.id)}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📥</Text>
            <Text style={styles.emptyTitle}>No offline modules yet</Text>
            <Text style={styles.emptyText}>
              Open a module and tap "Save for offline" to download it.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  heading:    { fontSize: 22, fontWeight: '700', color: C.text, paddingHorizontal: 20, paddingTop: 54 },
  sub:        { fontSize: 13, color: C.muted, paddingHorizontal: 20, marginBottom: 20 },
  list:       { paddingHorizontal: 20, paddingBottom: 80 },
  card:       { backgroundColor: C.white, borderRadius: 12, flexDirection: 'row',
                marginBottom: 12, elevation: 2, overflow: 'hidden' },
  cardBody:   { flex: 1, padding: 14 },
  catTag:     { fontSize: 11, fontWeight: '700', color: C.primary,
                backgroundColor: C.light, alignSelf: 'flex-start',
                paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  cardTitle:  { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 4 },
  cardMeta:   { fontSize: 12, color: C.muted },
  removeBtn:  { padding: 18, justifyContent: 'center', alignItems: 'center' },
  removeText: { fontSize: 16, color: '#E07A5F' },
  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 6 },
  emptyText:  { fontSize: 14, color: C.muted, textAlign: 'center', paddingHorizontal: 40 },
});
