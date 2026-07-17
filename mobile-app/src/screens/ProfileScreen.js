// mobile-app/src/screens/ProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const C = { primary: '#2D6A4F', light: '#B7E4C7', bg: '#F5FFF9',
            text: '#1B4332', muted: '#6B9080', white: '#FFFFFF',
            error: '#D62828' };

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => u && setUser(JSON.parse(u)));
  }, []);

  const logout = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user.name?.charAt(0).toUpperCase() || 'F'}
        </Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{user.role?.toUpperCase()}</Text>
      </View>

      {user.location && (
        <Text style={styles.location}>📍 {user.location}</Text>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg, alignItems: 'center',
                justifyContent: 'center', paddingHorizontal: 32 },
  avatar:     { width: 88, height: 88, borderRadius: 44,
                backgroundColor: C.primary, justifyContent: 'center',
                alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 36, color: C.white, fontWeight: '700' },
  name:       { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  email:      { fontSize: 14, color: C.muted, marginBottom: 12 },
  badge:      { backgroundColor: C.light, borderRadius: 8,
                paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  badgeText:  { fontSize: 12, fontWeight: '700', color: C.primary },
  location:   { fontSize: 14, color: C.muted, marginBottom: 40 },
  logoutBtn:  { borderWidth: 1.5, borderColor: C.error, borderRadius: 10,
                paddingVertical: 13, paddingHorizontal: 40 },
  logoutText: { color: C.error, fontSize: 15, fontWeight: '600' },
});
