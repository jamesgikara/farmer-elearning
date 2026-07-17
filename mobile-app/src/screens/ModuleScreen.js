// mobile-app/src/screens/ModuleScreen.js
// Renders module content (video / text / image) with download + feedback

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image, TextInput,
} from 'react-native';
import Video from 'react-native-video';
import api from '../utils/api';
import { saveModuleOffline, isModuleCached, removeOfflineModule } from '../utils/offlineStorage';

const C = {
  primary: '#2D6A4F',
  light:   '#B7E4C7',
  bg:      '#F5FFF9',
  text:    '#1B4332',
  muted:   '#6B9080',
  white:   '#FFFFFF',
  error:   '#D62828',
};

export default function ModuleScreen({ route }) {
  const { module } = route.params;
  const [cached,   setCached]   = useState(false);
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState('');
  const [submitted,setSubmitted]= useState(false);
  const [marking,  setMarking]  = useState(false);

  useEffect(() => {
    isModuleCached(module.module_id).then(setCached);
    // Mark as started progress
    api.post('/progress', { module_id: module.module_id }).catch(() => {});
  }, [module.module_id]);

  const toggleOffline = async () => {
    if (cached) {
      await removeOfflineModule(module.module_id);
      await api.delete(`/downloads/${module.module_id}`).catch(() => {});
      setCached(false);
    } else {
      await saveModuleOffline(module);
      await api.post('/downloads', { module_id: module.module_id }).catch(() => {});
      setCached(true);
    }
  };

  const markComplete = async () => {
    setMarking(true);
    try {
      await api.post('/progress', { module_id: module.module_id });
      Alert.alert('', 'Module marked as complete! 🎉');
    } catch {
      Alert.alert('Error', 'Could not save progress. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  const submitFeedback = async () => {
    if (!rating) {
      Alert.alert('', 'Please select a star rating.');
      return;
    }
    try {
      await api.post('/feedback', { module_id: module.module_id, rating, comment });
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'Could not submit feedback.');
    }
  };

  const renderContent = () => {
    if (module.content_type === 'video' && module.file_url) {
      return (
        <Video
          source={{ uri: module.file_url }}
          style={styles.video}
          controls
          resizeMode="contain"
          paused={false}
        />
      );
    }
    if (module.content_type === 'image' && module.file_url) {
      return (
        <Image
          source={{ uri: module.file_url }}
          style={styles.image}
          resizeMode="contain"
        />
      );
    }
    return (
      <View style={styles.textContent}>
        <Text style={styles.bodyText}>
          {module.description || 'No content available for this module.'}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title & meta */}
      <Text style={styles.title}>{module.title}</Text>
      <Text style={styles.meta}>
        {module.category}  ·  {module.duration_mins ? `${module.duration_mins} min` : 'Self-paced'}
      </Text>

      {/* Content area */}
      <View style={styles.contentBox}>{renderContent()}</View>

      {/* Description */}
      {module.description && module.content_type !== 'text' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this module</Text>
          <Text style={styles.bodyText}>{module.description}</Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, cached ? styles.btnOutline : styles.btnPrimary]}
          onPress={toggleOffline}
        >
          <Text style={[styles.btnText, cached ? styles.btnTextOutline : styles.btnTextWhite]}>
            {cached ? '✓ Remove offline copy' : '⬇  Save for offline'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSuccess, marking && styles.btnDisabled]}
          onPress={markComplete}
          disabled={marking}
        >
          {marking
            ? <ActivityIndicator color={C.white} />
            : <Text style={styles.btnTextWhite}>✓ Mark as complete</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Feedback */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rate this module</Text>
        {submitted ? (
          <Text style={styles.thanks}>Thank you for your feedback! 🙌</Text>
        ) : (
          <>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={[styles.star, n <= rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor={C.muted}
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submitFeedback}>
              <Text style={styles.btnTextWhite}>Submit feedback</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  content:      { padding: 20, paddingBottom: 60 },
  title:        { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 6, lineHeight: 28 },
  meta:         { fontSize: 13, color: C.muted, marginBottom: 16 },
  contentBox:   { borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', marginBottom: 20 },
  video:        { width: '100%', height: 220 },
  image:        { width: '100%', height: 280, backgroundColor: C.light },
  textContent:  { backgroundColor: C.white, padding: 16, borderRadius: 12 },
  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 10 },
  bodyText:     { fontSize: 15, color: C.text, lineHeight: 24 },
  actions:      { gap: 10, marginBottom: 28 },
  btn:          { borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginBottom: 8 },
  btnPrimary:   { backgroundColor: C.primary },
  btnOutline:   { borderWidth: 1.5, borderColor: C.primary },
  btnSuccess:   { backgroundColor: '#1B7A34' },
  btnDisabled:  { opacity: 0.7 },
  btnText:      { fontSize: 15, fontWeight: '600' },
  btnTextWhite: { color: C.white, fontSize: 15, fontWeight: '600' },
  btnTextOutline:{ color: C.primary, fontSize: 15, fontWeight: '600' },
  stars:        { flexDirection: 'row', marginBottom: 12 },
  star:         { fontSize: 30, color: '#CCC', marginRight: 6 },
  starActive:   { color: '#F4A261' },
  commentInput: { borderWidth: 1.5, borderColor: C.light, borderRadius: 10,
                  padding: 12, fontSize: 14, color: C.text, marginBottom: 12,
                  minHeight: 80, textAlignVertical: 'top' },
  thanks:       { fontSize: 15, color: C.primary, fontWeight: '600' },
});
