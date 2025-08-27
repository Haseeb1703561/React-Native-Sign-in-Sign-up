import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';
import InfoModal, { InfoModalType } from '../components/ui/InfoModal';
import { useIsFocused } from '@react-navigation/native';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [modal, setModal] = useState<{ visible: boolean; title: string; message: string; type: InfoModalType }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [isInRecoveryFlow, setIsInRecoveryFlow] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pendingNav, setPendingNav] = useState<Href | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const isFocused = useIsFocused();

  useEffect(() => {
    let alive = true;
    const handleTokenExchange = async () => {
      try {
        console.log('Reset password screen - params:', params);

        // Extract all parameters
        let accessToken = params.access_token as string;
        let refreshToken = params.refresh_token as string;
        let type = params.type as string;
        let code = params.code as string;

        console.log('Extracted from params:', { accessToken, refreshToken, type, code });

        // Handle the recovery code flow (most common case)
        if (code) {
          console.log('Recovery code detected:', code);
          setIsInRecoveryFlow(true);
          // Immediately exchange code for a session so user can retry without re-exchanging later
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.log('Initial code exchange failed, checking existing session…', error);
              const { data: s } = await supabase.auth.getSession();
              if (!s?.session) {
                if (alive && !completed && isFocused) {
                  setModal({
                    visible: true,
                    title: 'Invalid Link',
                    message: 'This password reset link is invalid or has expired. Please request a new one.',
                    type: 'error',
                  });
                  setPendingNav('/auth');
                }
                return;
              }
            } else {
              console.log('Initial code exchange successful');
            }
          } catch (e) {
            console.log('Unexpected error exchanging code on mount:', e);
          }
          setIsProcessing(false);
          return;
        }

        // Handle direct token flow (if tokens are provided directly)
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('Direct token exchange...');
          
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Token exchange failed:', error);
            if (alive && !completed && isFocused) {
              setModal({
                visible: true,
                title: 'Session Error',
                message: 'Unable to verify your reset request. Please request a new reset link.',
                type: 'error',
              });
              setPendingNav('/auth');
            }
            return;
          } else {
            console.log('Token exchange successful');
          }
        }

        console.log('Ready for password reset');
        setIsProcessing(false);
      } catch (error) {
        console.error('Token exchange error:', error);
        setIsProcessing(false);
      }
    };

    handleTokenExchange();
    return () => { alive = false; };
  }, [router, params, completed, isFocused]);

  // Prevent auto-navigation to Home if a session gets created during recovery flow
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isInRecoveryFlow && session?.user && !isUpdating) {
        // Do nothing — keep the temporary recovery session so user can retry.
        console.log('Auth event during recovery (ignored):', event);
      }
    });
    return () => subscription.unsubscribe();
  }, [isInRecoveryFlow, params.code, router, isUpdating]);

  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setModal({ visible: true, title: 'Error', message: 'Please enter both password fields', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setModal({ visible: true, title: 'Error', message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setModal({ visible: true, title: 'Error', message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);
    setIsUpdating(true);
    try {
      const code = params.code as string;
      console.log('Attempting password reset with code:', code);

      // For recovery code flow (most common)
      if (code) {
        console.log('Using recovery code flow...');
        // We should already have a session from initial exchange; verify
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isFocused && !completed) {
            setModal({
              visible: true,
              title: 'Invalid Link',
              message: 'This password reset link is invalid or has expired. Please request a new one.',
              type: 'error',
            });
            setPendingNav('/auth');
          }
          return;
        }

        // Now update the password
        console.log('Updating password...');
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          const msg = error.message || '';
          const lower = msg.toLowerCase();
          const isSamePw = lower.includes('should be different') || lower.includes('same as') || (lower.includes('different') && lower.includes('password'));
          if (isSamePw) {
            console.warn('Password update rejected: new password equals old password');
            // Show warning modal, avoid any navigation
            setModal({
              visible: true,
              title: 'Please choose a new password',
              message: 'New password should be different from the old password.',
              type: 'warning',
            });
          } else {
            console.error('Password update error:', error);
            setModal({ visible: true, title: 'Error', message: msg, type: 'error' });
          }
        } else {
          console.log('Password updated successfully');
          
          // Sign out and redirect to styled modal on auth screen
          setCompleted(true);
          await supabase.auth.signOut();
          console.log('User signed out after password reset');

          router.replace('/auth?reset=1');
        }
        return;
      }

      // Handle direct token flow (if tokens are provided)
      let accessToken = params.access_token as string;
      let refreshToken = params.refresh_token as string;

      if (accessToken && refreshToken) {
        console.log('Using direct token flow...');
        
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Token exchange failed:', error);
          if (isFocused && !completed) {
            setModal({
              visible: true,
              title: 'Session Error',
              message: 'Unable to verify your reset request. Please request a new reset link.',
              type: 'error',
            });
            setPendingNav('/auth');
          }
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          const msg = updateError.message || '';
          const lower = msg.toLowerCase();
          const isSamePw = lower.includes('should be different') || lower.includes('same as') || (lower.includes('different') && lower.includes('password'));
          if (isSamePw) {
            console.warn('Password update rejected: new password equals old password');
            setModal({
              visible: true,
              title: 'Please choose a new password',
              message: 'New password should be different from the old password.',
              type: 'warning',
            });
          } else {
            console.error('Password update error:', updateError);
            setModal({ visible: true, title: 'Error', message: msg, type: 'error' });
          }
        } else {
          console.log('Password updated successfully');
          
          // Sign out and redirect to styled modal on auth screen
          await supabase.auth.signOut();
          console.log('User signed out after password reset');

          router.replace('/auth?reset=1');
        }
        return;
      }

      // No valid parameters found
      console.log('No valid reset parameters found');
      if (isFocused && !completed) {
        setModal({
          visible: true,
          title: 'Invalid Request',
          message: 'Invalid password reset request. Please request a new reset link.',
          type: 'error',
        });
        setPendingNav('/auth');
      }
    } catch (error) {
      console.error('Update password error:', error);
      setModal({ visible: true, title: 'Error', message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Processing...</Text>
          <Text style={styles.subheading}>
            Verifying your password reset request...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InfoModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => {
          setModal({ ...modal, visible: false });
          if (pendingNav) {
            const target = pendingNav;
            setPendingNav(null);
            router.replace(target);
          }
        }}
      />
      <View style={styles.card}>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subheading}>
          Enter your new password below.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor="#9ca3af"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          placeholderTextColor="#9ca3af"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        <TouchableOpacity 
          style={[styles.button, styles.primary]} 
          onPress={updatePassword}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
});
