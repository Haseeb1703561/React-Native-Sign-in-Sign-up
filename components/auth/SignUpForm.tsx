import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import GoogleSignIn from '../GoogleSignIn';
import InfoModal from '../ui/InfoModal';

interface Props {
  onSwitchToSignIn: () => void;
}

export default function SignUpForm({ onSwitchToSignIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, title: '', message: '', type: 'info' });

  const signUpWithEmail = async () => {
    if (!email || !password || !confirm) {
      setModal({ visible: true, title: 'Missing details', message: 'Please fill in all fields.', type: 'error' });
      return;
    }
    if (password !== confirm) {
      setModal({ visible: true, title: 'Passwords do not match', message: 'Please make sure both passwords are the same.', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setModal({ visible: true, title: 'Sign up failed', message: error.message, type: 'error' });
    } else {
      setModal({ visible: true, title: 'Verify your email', message: 'We sent you a confirmation link. Please verify to finish signing up.', type: 'success' });
    }
    setLoading(false);
  };

  return (
    <View style={styles.card}>
      <InfoModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, visible: false })}
      />

      <Text style={styles.heading}>Create your account</Text>
      <Text style={styles.subheading}>Join AI Tutor in seconds</Text>

      <GoogleSignIn />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#9ca3af"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        textContentType="password"
      />

      <TouchableOpacity style={[styles.button, styles.primary]} onPress={signUpWithEmail} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
      </TouchableOpacity>

      <View style={styles.bottomRow}>
        <Text style={styles.smallText}>Already have an account?</Text>
        <TouchableOpacity onPress={onSwitchToSignIn}>
          <Text style={styles.link}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subheading: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  smallText: { color: '#6b7280' },
  link: { color: '#2563eb', fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { marginHorizontal: 12, color: '#9ca3af' },
});

