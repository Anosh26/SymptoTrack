import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Get theme colors for inputs
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const placeholderColor = useThemeColor({ light: '#9BA1A6', dark: '#9BA1A6' }, 'icon');
  const inputBgColor = useThemeColor({ light: '#f0f0f0', dark: '#1e1e1e' }, 'background');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');

  const handleEmailLogin = () => {
    // Implement your Email Auth Logic here
    Alert.alert('Email Auth', `Logging in with: ${email}`);
    // On success: router.replace('/(tabs)');
  };

  const handleGoogleLogin = async () => {
    // Implement Google Sign-In Logic
    // const userInfo = await GoogleSignin.signIn();
    Alert.alert('Google Login', 'Google Sign-In logic goes here');
  };

  const handleAppleLogin = async () => {
    // Implement Apple Sign-In Logic
    // const credential = await AppleAuthentication.signInAsync(...);
    Alert.alert('Apple Login', 'Apple Sign-In logic goes here');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Header Section */}
          <View style={styles.header}>
            <Ionicons name="medical" size={64} color="#0a7ea4" style={{ marginBottom: 20 }} />
            <ThemedText type="title">{isSignUp ? 'Create Account' : 'Welcome Back'}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {isSignUp ? 'Sign up to start tracking your symptoms' : 'Log in to continue your health journey'}
            </ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor }]}>
              <Ionicons name="mail-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Email Address"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor }]}>
              <Ionicons name="lock-closed-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleEmailLogin}>
              <ThemedText style={styles.primaryButtonText}>
                {isSignUp ? 'Sign Up' : 'Log In'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              <ThemedText style={styles.dividerText}>or continue with</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={[styles.socialButton, { borderColor }]} 
                onPress={handleGoogleLogin}
              >
                <Ionicons name="logo-google" size={24} color={textColor} />
                <ThemedText style={styles.socialButtonText}>Google</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, { borderColor }]} 
                onPress={handleAppleLogin}
              >
                <Ionicons name="logo-apple" size={24} color={textColor} />
                <ThemedText style={styles.socialButtonText}>Apple</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </ThemedText>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <ThemedText type="link">{isSignUp ? 'Log In' : 'Sign Up'}</ThemedText>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.6,
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    gap: 8,
  },
  socialButtonText: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});