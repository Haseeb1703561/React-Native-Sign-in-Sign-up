import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabase';
import InfoModal from '@/components/ui/InfoModal';

// Dedicated auth route rendered outside the tab navigator so no bottom tab bar shows
export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reset?: string }>();
  const [showResetModal, setShowResetModal] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    let mounted = true;

    // If the user is already logged in and this screen is focused, go to the main app
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted && user && isFocused) router.replace('/');
    });

    // Listen for login and then navigate to the tabs
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && isFocused) router.replace('/');
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, isFocused]);

  // If navigated here after password reset, show a pretty success modal
  useEffect(() => {
    if (params.reset === '1') {
      setShowResetModal(true);
    }
  }, [params.reset]);

  return (
    <>
      <InfoModal
        visible={showResetModal}
        title="Password updated"
        message="Your password has been updated. Please sign in with your new password."
        type="success"
        onClose={() => {
          setShowResetModal(false);
          // Remove the reset flag from the URL so the modal doesn't show again
          router.replace('/auth');
        }}
      />
      <Auth />
    </>
  );
}

