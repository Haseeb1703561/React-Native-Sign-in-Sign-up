// This file connects your app to Supabase
// Think of it as a bridge between your app and the database

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Get the URL and key from your environment file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create the connection to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // This stores user login info on the device
    storage: AsyncStorage,
    // Automatically refresh login tokens
    autoRefreshToken: true,
    // Keep users logged in between app sessions
    persistSession: true,
    // Don't detect sessions from URLs (mobile app setting)
    detectSessionInUrl: false,
    // Enable PKCE flow for mobile OAuth (required for exchangeCodeForSession)
    flowType: 'pkce',
  },
});

// Export a simple function to check if user is logged in
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Export a simple function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
