// mobile-app/src/screens/admin/AdminHomeScreen.js
// Dashboard showing summary statistics for admin/officers

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../utils/api';

const C = { primary: '#2D6A4F', light: '#B7E4C7', bg: '#F5FFF9',
            text: '#1B4332', muted: '#6B9080', white: '#FFFFFF',
            accent1: '#3A86FF', accent2: '#E07A5F', accent3: '#F4A261' };

function StatCard({ label, value, color, icon }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminHomeScreen() {
  const [summary, setSummary] = useState(null);
  const [catData, setCatData] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get('/reports/summary').catch(() => ({ data: {} })),
        api.get('/reports/category-engagement').catch(() => ({ data: [] })),
      ]).then(([s, c]) => {
        setSummary(s.data);
        setCatData(c.data);
      }).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Dashboard</Text>

      {/* Summary stats */}
      {summary && (
        <View style={styles.statsGrid}>
          <StatCard label="Total Farmers"  value={summary.total_farmers  || 0} color={C.primary}   icon="👩‍🌾" />
          <StatCard label="Published Modules" value={summary.published_modules || 0} color={C.accent1} icon="📚" />
          <StatCard label="Completions"    value={summary.total_completions || 0} color={C.accent2} icon="✅" />
          <StatCard label="Avg. Rating"    value={`${summary.avg_rating || '0.00'} ★`} color={C.accent3} icon="⭐" />
        </View>
      )}

      {/* Category engagement */}
      <Text style={styles.sectionTitle}>Category Engagement</Text>
      {catData.map((row, i) => {
        const maxComp = Math.max(...catData.map(r => r.completions), 1);
        const pct = Math.round((row.completions / maxComp) * 100);
        return (
          <View key={i} style={styles.catRow}>
            <View style={styles.catInfo}>
              <Text style={styles.catName}>{row.category}</Text>
              <Text style={styles.catMeta}>{row.module_count} modules · {row.completions} completions</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  content:      { padding: 20, paddingTop: 54, paddingBottom: 80 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading:      { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 20 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard:     { backgroundColor: C.white, borderRadius: 12, padding: 16,
                  width: '47%', borderLeftWidth: 4, elevation: 2,
                  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  statIcon:     { fontSize: 22, marginBottom: 6 },
  statValue:    { fontSize: 26, fontWeight: '800', marginBottom: 2 },
  statLabel:    { fontSize: 12, color: C.muted, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 14 },
  catRow:       { backgroundColor: C.white, borderRadius: 10, padding: 14, marginBottom: 10 },
  catInfo:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName:      { fontSize: 14, fontWeight: '600', color: C.text },
  catMeta:      { fontSize: 12, color: C.muted },
  barBg:        { height: 6, backgroundColor: C.light, borderRadius: 3 },
  barFill:      { height: 6, backgroundColor: C.primary, borderRadius: 3 },
});
