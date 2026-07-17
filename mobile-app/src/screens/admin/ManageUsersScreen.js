// mobile-app/src/screens/admin/ManageUsersScreen.js

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

const ROLE_COLORS = { admin: '#D62828', officer: '#3A86FF', farmer: '#2D6A4F' };

export default function ManageUsersScreen() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/users')
        .then(r => setUsers(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const toggleActive = async (user) => {
    await api.put(`/users/${user.user_id}`, { is_active: !user.is_active });
    setUsers(prev => prev.map(u =>
      u.user_id === user.user_id ? { ...u, is_active: !u.is_active } : u
    ));
  };

  const deleteUser = (id, name) => {
    Alert.alert(`Delete ${name}?`, 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/users/${id}`).catch(e =>
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete user')
          );
          setUsers(prev => prev.filter(u => u.user_id !== id));
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Users</Text>
      <Text style={styles.sub}>{users.length} total accounts</Text>
      <FlatList
        data={users}
        keyExtractor={u => String(u.user_id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.full_name?.charAt(0) || '?'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <View style={[styles.roleTag, { backgroundColor: ROLE_COLORS[item.role] + '22' }]}>
                <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] }]}>
                  {item.role}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Switch
                value={!!item.is_active}
                onValueChange={() => toggleActive(item)}
                trackColor={{ false: '#ccc', true: C.light }}
                thumbColor={item.is_active ? C.primary : '#999'}
              />
              <TouchableOpacity onPress={() => deleteUser(item.user_id, item.full_name)}>
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading:   { fontSize: 22, fontWeight: '700', color: C.text,
               paddingHorizontal: 20, paddingTop: 54 },
  sub:       { fontSize: 13, color: C.muted, paddingHorizontal: 20, marginBottom: 16 },
  list:      { paddingHorizontal: 20, paddingBottom: 80 },
  card:      { backgroundColor: C.white, borderRadius: 12, flexDirection: 'row',
               alignItems: 'center', marginBottom: 10, padding: 14, elevation: 2 },
  avatar:    { width: 42, height: 42, borderRadius: 21,
               backgroundColor: C.primary, justifyContent: 'center',
               alignItems: 'center', marginRight: 12 },
  avatarText:{ color: C.white, fontWeight: '700', fontSize: 16 },
  info:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 2 },
  email:     { fontSize: 12, color: C.muted, marginBottom: 4 },
  roleTag:   { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText:  { fontSize: 11, fontWeight: '700' },
  actions:   { alignItems: 'center', gap: 6 },
  deleteText:{ color: C.error, fontSize: 18, fontWeight: '700', paddingTop: 4 },
});
