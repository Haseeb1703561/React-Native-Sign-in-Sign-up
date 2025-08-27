// Home screen that shows when user is logged in
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { signOut } from '../lib/supabase';

interface HomeProps {
  user: any; // The logged-in user information
}

export default function Home({ user }: HomeProps) {
  // Function to handle sign out
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to AI Tutor! 🎓</Text>
        <Text style={styles.subtitle}>
          Hello, {user?.email || 'User'}!
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Learning Journey</Text>
        <Text style={styles.description}>
          Your AI-powered tutor is ready to help you learn anything you want!
        </Text>

        {/* Placeholder for future features */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🤖 AI Chat</Text>
          <Text style={styles.featureDescription}>
            Chat with your AI tutor (Coming Soon)
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>📚 Lessons</Text>
          <Text style={styles.featureDescription}>
            Personalized lessons (Coming Soon)
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>📊 Progress</Text>
          <Text style={styles.featureDescription}>
            Track your learning progress (Coming Soon)
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
