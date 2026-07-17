// mobile-app/src/screens/LoginScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const C = {
  primary:  '#2D6A4F',
  light:    '#B7E4C7',
  bg:       '#F5FFF9',
  text:     '#1B4332',
  muted:    '#6B9080',
  error:    '#D62828',
  white:    '#FFFFFF',
};

export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user',  JSON.stringify(res.data.user));

      const role = res.data.user.role;
      navigation.replace(
        role === 'admin' || role === 'officer' ? 'AdminMain' : 'Main'
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo / Brand */}
        <View style={styles.brandBlock}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.appName}>FarmerLearn</Text>
          <Text style={styles.tagline}>Agricultural knowledge, anywhere.</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Your password"
            placeholderTextColor={C.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={styles.btnText}>Sign in</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>New here? Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  inner:      { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  brandBlock: { alignItems: 'center', marginBottom: 36 },
  logoCircle: { width: 80, height: 80, borderRadius: 40,
                backgroundColor: C.light, justifyContent: 'center',
                alignItems: 'center', marginBottom: 12 },
  logoEmoji:  { fontSize: 36 },
  appName:    { fontSize: 28, fontWeight: '700', color: C.text, letterSpacing: 0.5 },
  tagline:    { fontSize: 14, color: C.muted, marginTop: 4 },
  card:       { backgroundColor: C.white, borderRadius: 16,
                padding: 24, elevation: 4,
                shadowColor: '#000', shadowOpacity: 0.08,
                shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  label:      { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input:      { borderWidth: 1.5, borderColor: C.light, borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 12,
                fontSize: 15, color: C.text, marginBottom: 16 },
  error:      { color: C.error, fontSize: 13, marginBottom: 12 },
  btn:        { backgroundColor: C.primary, borderRadius: 10,
                paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  btnDisabled:{ opacity: 0.7 },
  btnText:    { color: C.white, fontSize: 16, fontWeight: '700' },
  link:       { textAlign: 'center', color: C.primary,
                fontSize: 14, fontWeight: '500' },
});
