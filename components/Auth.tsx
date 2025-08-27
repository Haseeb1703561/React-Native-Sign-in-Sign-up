// Modernized auth screen with separate Sign In / Sign Up forms
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Image } from 'react-native';
import SignInForm from './auth/SignInForm';
import SignUpForm from './auth/SignUpForm';

export default function Auth() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Decorative background shapes */}
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />

        <View style={styles.content}>
          <Image source={require('../assets/images/ai-tutor-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appTitle}>AI Tutor</Text>
          <Text style={styles.appSubtitle}>Your AI learning companion</Text>

          {/* Segmented control */}
          <View style={styles.segmented}>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.segmentButton, mode === 'signIn' && styles.segmentActive]}
              onPress={() => setMode('signIn')}
            >
              <Text style={[styles.segmentText, mode === 'signIn' && styles.segmentTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.segmentButton, mode === 'signUp' && styles.segmentActive]}
              onPress={() => setMode('signUp')}
            >
              <Text style={[styles.segmentText, mode === 'signUp' && styles.segmentTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Forms */}
          <View style={styles.formArea}>
            {mode === 'signIn' ? (
              <SignInForm onSwitchToSignUp={() => setMode('signUp')} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setMode('signIn')} />
            )}
          </View>

          <Text style={styles.footerNote}>By continuing you agree to our Terms and Privacy Policy.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { width: '100%', maxWidth: 440, paddingHorizontal: 20 },
  logo: { width: 72, height: 72, alignSelf: 'center', marginBottom: 6 },
  appTitle: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center' },
  appSubtitle: { marginTop: 6, marginBottom: 16, fontSize: 14, color: '#6b7280', textAlign: 'center' },

  segmented: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 4,
    gap: 6,
    alignSelf: 'center',
    width: '100%',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: { color: '#6b7280', fontWeight: '600' },
  segmentTextActive: { color: '#111827' },

  formArea: { marginTop: 14 },
  footerNote: { textAlign: 'center', color: '#9ca3af', marginTop: 16, fontSize: 12 },

  // subtle decorative circles
  blobOne: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#dbeafe',
  },
  blobTwo: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fef3c7',
  },
});
