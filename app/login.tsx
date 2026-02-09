import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Supabase
import { supabase } from '../lib/supabase';

// UI Components (Keep your existing ones)
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AuthInput } from '@/components/auth/AuthInput';

export default function LoginScreen() {
  const router = useRouter();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- SUPABASE HANDLERS ---
  
  const handleAuth = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);

    try {
      if (isSignUp) {
        // SIGN UP
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for the confirmation link!');
      } else {
        // SIGN IN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Navigation is handled automatically by _layout.tsx based on session state
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <Ionicons name="medical" size={64} color="#0a7ea4" style={{ marginBottom: 20 }} />
              <ThemedText type="title" style={styles.title}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </ThemedText>
            </View>

            <View style={styles.formContainer}>
              <AuthInput 
                iconName="mail-outline" 
                placeholder="Email Address" 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
              />

              <AuthInput 
                iconName="lock-closed-outline" 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />

              <TouchableOpacity 
                style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
                onPress={handleAuth}
                disabled={loading}
              >
                <ThemedText style={styles.primaryButtonText}>
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.footer}>
                <ThemedText>{isSignUp ? 'Already have an account? ' : "Don't have an account? "}</ThemedText>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                  <ThemedText type="link">{isSignUp ? 'Log In' : 'Sign Up'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { textAlign: 'center' },
  formContainer: { gap: 4 },
  primaryButton: { backgroundColor: '#0a7ea4', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
});