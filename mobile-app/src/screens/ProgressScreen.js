// mobile-app/src/screens/ProgressScreen.js
// Shows farmer's learning progress grouped by category

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';

const C = { primary: '#2D6A4F', light: '#B7E4C7', bg: '#F5FFF9',
            text: '#1B4332', muted: '#6B9080', white: '#FFFFFF' };

export default function ProgressScreen() {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/progress')
        .then(res => setRecords(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  // Group by category
  const grouped = records.reduce((acc, r) => {
    const cat = r.category || 'Other';
    if (!acc[cat]) acc[cat] = { total: 0, done: 0 };
    acc[cat].total++;
    if (r.completed) acc[cat].done++;
    return acc;
  }, {});

  const completed = records.filter(r => r.completed).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>My Progress</Text>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <Text style={styles.bigNum}>{completed}</Text>
        <Text style={styles.summaryLabel}>Modules completed</Text>
        <Text style={styles.summaryTotal}>out of {records.length} started</Text>
      </View>

      {/* Per-category */}
      {Object.keys(grouped).length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyTitle}>No progress yet</Text>
          <Text style={styles.emptyText}>Start a learning module to track your progress here.</Text>
        </View>
      ) : (
        Object.entries(grouped).map(([cat, { total, done }]) => {
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <View key={cat} style={styles.catCard}>
              <View style={styles.catHeader}>
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catPct}>{pct}%</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.catDetail}>{done} of {total} modules complete</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  content:      { padding: 20, paddingBottom: 80 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading:      { fontSize: 22, fontWeight: '700', color: C.text, marginTop: 34, marginBottom: 20 },
  summaryCard:  { backgroundColor: C.primary, borderRadius: 16, padding: 24,
                  alignItems: 'center', marginBottom: 24 },
  bigNum:       { fontSize: 52, fontWeight: '800', color: C.white },
  summaryLabel: { fontSize: 16, color: C.light, fontWeight: '600', marginTop: 4 },
  summaryTotal: { fontSize: 13, color: C.light + 'CC', marginTop: 2 },
  catCard:      { backgroundColor: C.white, borderRadius: 12, padding: 16,
                  marginBottom: 12, elevation: 2,
                  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  catHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  catName:      { fontSize: 15, fontWeight: '700', color: C.text },
  catPct:       { fontSize: 15, fontWeight: '700', color: C.primary },
  barBg:        { height: 8, backgroundColor: C.light, borderRadius: 4, marginBottom: 8 },
  barFill:      { height: 8, backgroundColor: C.primary, borderRadius: 4 },
  catDetail:    { fontSize: 12, color: C.muted },
  empty:        { alignItems: 'center', paddingTop: 40 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 6 },
  emptyText:    { fontSize: 14, color: C.muted, textAlign: 'center', paddingHorizontal: 40 },
});
