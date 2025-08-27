// Google Sign-In component for your AI Tutor app
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';

// This is required for the OAuth flow to work properly
WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignIn() {
  const [loading, setLoading] = useState(false);

  // Function to start Google sign-in
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Use a native deep link for development builds/standalone apps.
      // Ensure the redirect path matches what we allow-listed in Supabase.
      const redirectUrl = makeRedirectUri({ scheme: 'aitutor', path: 'redirect' }); // 'aitutor://redirect'
      console.log('[Auth] Using redirectUrl:', redirectUrl);

      // Ask Supabase for the Google OAuth URL (don't auto-redirect)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      console.log('[Auth] Supabase returned auth URL:', data?.url);



      // Open the OAuth URL in a web browser session; the deep link will route to /redirect
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        console.log('[Auth] Result from openAuthSessionAsync:', result);
        // Do not exchange the code here; app/redirect.tsx handles it to avoid double exchanges
      }


      // When the browser closes, Supabase should have completed the sign-in
      // AuthWrapper listens for the auth state change and will switch screens accordingly
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={signInWithGoogle}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#4285F4" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {/* Google Logo */}
          <View style={styles.googleLogo}>
            <Text style={styles.googleLogoText}>G</Text>
          </View>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleLogoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
  },
});
