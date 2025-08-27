import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type InfoModalType = 'success' | 'error' | 'info' | 'warning';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  type?: InfoModalType;
  onClose: () => void;
  confirmText?: string;
}

export default function InfoModal({ visible, title, message, type = 'info', onClose, confirmText = 'OK' }: Props) {
  const palette = {
    success: { bg: '#ecfdf5', fg: '#065f46' },
    error:   { bg: '#fef2f2', fg: '#991b1b' },
    info:    { bg: '#eff6ff', fg: '#1e40af' },
    warning: { bg: '#fffbeb', fg: '#92400e' },
  }[type];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: palette.bg }]}> 
            <Text style={[styles.iconText, { color: palette.fg }]}>{type === 'success' ? '✓' : type === 'error' ? '!' : type === 'warning' ? '!' : 'i'}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconText: { fontSize: 26, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  message: { marginTop: 6, fontSize: 14, color: '#4b5563', textAlign: 'center' },
  button: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

