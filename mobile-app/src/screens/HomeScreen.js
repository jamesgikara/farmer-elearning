// mobile-app/src/screens/HomeScreen.js
// Farmer's home — scrollable list of learning modules with search

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
  StatusBar, Image,
} from 'react-native';
import api from '../utils/api';
import { isModuleCached } from '../utils/offlineStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const C = {
  primary: '#2D6A4F',
  light:   '#B7E4C7',
  bg:      '#F5FFF9',
  text:    '#1B4332',
  muted:   '#6B9080',
  card:    '#FFFFFF',
  badge:   '#52B788',
};

const CATEGORY_COLORS = {
  'Crop Management':    '#52B788',
  'Pest & Disease':     '#E07A5F',
  'Soil Health':        '#8B6914',
  'Market Access':      '#3A86FF',
  'Water Management':   '#4CC9F0',
  'Sustainable Farming':'#95D5B2',
};

function ModuleCard({ item, onPress }) {
  const [cached, setCached] = useState(false);

  useEffect(() => {
    isModuleCached(item.module_id).then(setCached);
  }, [item.module_id]);

  const catColor = CATEGORY_COLORS[item.category] || C.badge;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cardThumb}>
        {item.thumbnail_url
          ? <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} />
          : <Text style={styles.thumbEmoji}>📚</Text>
        }
        {cached && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>✓ Offline</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={[styles.catTag, { backgroundColor: catColor + '22' }]}>
          <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>
            {item.content_type === 'video' ? '🎬' : item.content_type === 'image' ? '🖼️' : '📄'}
            {'  '}{item.duration_mins ? `${item.duration_mins} min` : 'Read'}
          </Text>
          {item.avg_rating > 0 && (
            <Text style={styles.rating}>⭐ {parseFloat(item.avg_rating).toFixed(1)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [modules,   setModules]   = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [userName,  setUserName]  = useState('Farmer');

  const loadModules = useCallback(async () => {
    try {
      const res = await api.get('/modules');
      setModules(res.data);
      setFiltered(res.data);
    } catch {
      // silently fail — may be offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
    AsyncStorage.getItem('user').then(u => {
      if (u) setUserName(JSON.parse(u).name?.split(' ')[0] || 'Farmer');
    });
  }, [loadModules]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? modules.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q)
      ) : modules
    );
  }, [search, modules]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName} 👋</Text>
          <Text style={styles.subGreeting}>What would you like to learn today?</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search modules…"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Module List */}
      <FlatList
        data={filtered}
        keyExtractor={m => String(m.module_id)}
        renderItem={({ item }) => (
          <ModuleCard item={item} onPress={() => navigation.navigate('Module', { module: item })} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadModules(); }}
            colors={[C.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No modules found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: C.bg },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
  greeting:         { fontSize: 22, fontWeight: '700', color: C.text },
  subGreeting:      { fontSize: 13, color: C.muted, marginTop: 2 },
  searchRow:        { paddingHorizontal: 20, marginBottom: 12 },
  search:           { backgroundColor: C.card, borderRadius: 12,
                      paddingHorizontal: 16, paddingVertical: 11,
                      fontSize: 15, color: C.text,
                      elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
                      shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  list:             { paddingHorizontal: 20, paddingBottom: 80 },
  card:             { backgroundColor: C.card, borderRadius: 14,
                      flexDirection: 'column', marginBottom: 14,
                      overflow: 'hidden', elevation: 3,
                      shadowColor: '#000', shadowOpacity: 0.07,
                      shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardThumb:        { width: '100%', height: 110, backgroundColor: C.light,
                      justifyContent: 'center', alignItems: 'center' },
  thumb:            { width: '100%', height: '100%', resizeMode: 'cover' },
  thumbEmoji:       { fontSize: 36 },
  offlineBadge:     { position: 'absolute', bottom: 0, left: 0, right: 0,
                      backgroundColor: C.primary + 'DD',
                      paddingVertical: 4, alignItems: 'center' },
  offlineBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  cardBody:         { padding: 14 },
  catTag:           { alignSelf: 'flex-start', borderRadius: 6,
                      paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 },
  catText:          { fontSize: 11, fontWeight: '700' },
  cardTitle:        { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 8, lineHeight: 20 },
  cardMeta:         { flexDirection: 'row', justifyContent: 'space-between' },
  metaText:         { fontSize: 12, color: C.muted },
  rating:           { fontSize: 12, color: C.muted },
  empty:            { alignItems: 'center', paddingTop: 60 },
  emptyText:        { color: C.muted, fontSize: 15 },
});
