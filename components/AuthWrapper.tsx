// This component decides whether to show login screen or main app
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Auth from './Auth';
import Home from './Home';

export default function AuthWrapper() {
  // Navigation hooks MUST be called unconditionally on every render
  const router = useRouter();
  const pathname = usePathname();
  const isFocused = useIsFocused();

  // State to track if user is logged in
  const [user, setUser] = useState<any>(null);
  // State to track if we're still checking login status
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in when app starts
    checkUser();

    // Listen for authentication changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup subscription when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Function to check current user
  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.log('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to /auth when unauthenticated (only when this screen is focused)
  useEffect(() => {
    if (!isFocused) return;
    if (!loading && !user) {
      // Avoid redirect loops when already on auth
      if (pathname === '/auth') return;
      router.replace('/auth');
    }
  }, [loading, user, pathname, router, isFocused]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If not logged in, show nothing while redirecting to /auth
  if (!user) {
    return null;
  }

  // If logged in, show main app (inside tabs)
  return <Home user={user} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
