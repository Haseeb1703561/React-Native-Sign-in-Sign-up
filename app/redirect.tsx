import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

// Minimal, nice-looking redirect screen that quickly finalizes sign-in
export default function OAuthRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState('Logging in…');

  // Simple animated checkmark circle
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  useEffect(() => {
    const complete = async () => {
      try {
        const code = (params?.code as string) || '';
        const errorDescription = (params?.error_description as string) || '';

        if (errorDescription) {
          setStatus(`Error: ${decodeURIComponent(errorDescription)}`);
          setTimeout(() => router.replace('/'), 400);
          return;
        }

        if (!code) {
          setStatus('Missing code in redirect URL');
          setTimeout(() => router.replace('/'), 300);
          return;
        }

        setStatus('Logging in…');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        try { await WebBrowser.dismissBrowser(); } catch {}
        router.replace('/');
      } catch (e: any) {
        setStatus(`Sign-in error: ${e?.message || 'Could not complete sign-in'}`);
        setTimeout(() => router.replace('/'), 500);
      }
    };

    complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0f17',
    paddingHorizontal: 20,
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#3b82f6',
    borderTopColor: 'transparent',
  },
  text: {
    marginTop: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 16,
  },
});

