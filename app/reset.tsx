import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

// Proper reset handler for Supabase password reset
export default function ResetHandler() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleReset = async () => {
      try {
        console.log('Reset handler - params:', params);

        // Get the full URL that opened the app
        const initialUrl = await Linking.getInitialURL();
        console.log('Reset handler - Initial URL:', initialUrl);

        let accessToken = params.access_token as string;
        let refreshToken = params.refresh_token as string;
        let type = params.type as string;
        let code = params.code as string;

        // Parse URL parameters from both query and fragment
        if (initialUrl) {
          console.log('Processing reset URL:', initialUrl);
          
          // Handle both # and ? parameters
          const url = new URL(initialUrl);
          
          // Check query parameters first
          const queryParams = new URLSearchParams(url.search);
          accessToken = queryParams.get('access_token') || accessToken;
          refreshToken = queryParams.get('refresh_token') || refreshToken;
          type = queryParams.get('type') || type;
          code = queryParams.get('code') || code;
          
          // Check fragment parameters (after #)
          if (url.hash) {
            const fragmentParams = new URLSearchParams(url.hash.substring(1));
            accessToken = fragmentParams.get('access_token') || accessToken;
            refreshToken = fragmentParams.get('refresh_token') || refreshToken;
            type = fragmentParams.get('type') || type;
            code = fragmentParams.get('code') || code;
          }
        }

        console.log('Extracted values:', { accessToken, refreshToken, type, code });

        // Build navigation parameters
        const navigationParams = new URLSearchParams();
        if (accessToken) navigationParams.set('access_token', accessToken);
        if (refreshToken) navigationParams.set('refresh_token', refreshToken);
        if (type) navigationParams.set('type', type);
        if (code) navigationParams.set('code', code);

        const paramString = navigationParams.toString();
        console.log('Navigation params:', paramString);

        // Always redirect to reset-password with all parameters
        if (paramString) {
          router.replace(`/reset-password?${paramString}`);
        } else {
          // Fallback - direct navigation
          router.replace('/reset-password');
        }

      } catch (error) {
        console.error('Reset handler error:', error);
        router.replace('/auth');
      }
    };

    handleReset();
  }, [router, params]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Processing password reset...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0f17',
  },
  text: {
    color: '#cbd5e1',
    fontSize: 16,
  },
});
