// mobile-app/src/screens/RegisterScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import api from '../utils/api';

const C = {
  primary: '#2D6A4F',
  light:   '#B7E4C7',
  bg:      '#F5FFF9',
  text:    '#1B4332',
  muted:   '#6B9080',
  error:   '#D62828',
  white:   '#FFFFFF',
};

export default function RegisterScreen({ navigation }) {
  const [form,    setForm]    = useState({ full_name: '', email: '', password: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const update = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  const handleRegister = async () => {
    const { full_name, email, password } = form;
    if (!full_name.trim() || !email.trim() || !password) {
      setError('Full name, email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: form.full_name.trim(),
        email:     form.email.trim().toLowerCase(),
        password:  form.password,
        location:  form.location.trim() || undefined,
        role:      'farmer',
      });
      navigation.replace('Login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBlock}>
          <Text style={styles.logoEmoji}>🌾</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.sub}>Join thousands of Kenyan farmers learning online</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Full name',  key: 'full_name',  placeholder: 'John Kamau',          kbType: 'default' },
            { label: 'Email',      key: 'email',       placeholder: 'john@example.com',    kbType: 'email-address' },
            { label: 'Password',   key: 'password',    placeholder: 'At least 6 characters', kbType: 'default', secure: true },
            { label: 'Location (optional)', key: 'location', placeholder: 'e.g. Kirinyaga', kbType: 'default' },
          ].map(({ label, key, placeholder, kbType, secure }) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={C.muted}
                autoCapitalize={kbType === 'email-address' ? 'none' : 'words'}
                keyboardType={kbType}
                secureTextEntry={!!secure}
                value={form[key]}
                onChangeText={update(key)}
              />
            </View>
          ))}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={styles.btnText}>Register</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  inner:      { padding: 24, paddingTop: 48 },
  brandBlock: { alignItems: 'center', marginBottom: 28 },
  logoEmoji:  { fontSize: 40, marginBottom: 8 },
  title:      { fontSize: 24, fontWeight: '700', color: C.text },
  sub:        { fontSize: 13, color: C.muted, marginTop: 4, textAlign: 'center' },
  card:       { backgroundColor: C.white, borderRadius: 16, padding: 24,
                elevation: 4, shadowColor: '#000', shadowOpacity: 0.08,
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
  link:       { textAlign: 'center', color: C.primary, fontSize: 14, fontWeight: '500' },
});
