import * as WebBrowser from 'expo-web-browser';
import { useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

// 1. WEB-SAFE WARMUP HOOK
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      void WebBrowser.warmUpAsync();
    }
    return () => {
      if (Platform.OS !== 'web') {
        void WebBrowser.coolDownAsync();
      }
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();
  
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); // <--- For verification code
  const [pendingVerification, setPendingVerification] = useState(false); // <--- Show verify screen?
  const [loading, setLoading] = useState(false);

  // Clerk Hooks
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  // Colors
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const placeholderColor = useThemeColor({ light: '#9BA1A6', dark: '#9BA1A6' }, 'icon');
  const inputBgColor = useThemeColor({ light: '#f0f0f0', dark: '#1e1e1e' }, 'background');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');

  // --- 1. SOCIAL LOGIN ---
  const handleSocialLogin = async (strategy: 'oauth_google' | 'oauth_apple') => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: strategy,
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }), 
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('SSO error', err);
      Alert.alert('Error', err.errors?.[0]?.message || 'Social login failed');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. EMAIL SIGN IN ---
  const handleEmailSignIn = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
    try {
      setLoading(true);
      const result = await signIn!.create({ identifier: email, password });
      
      if (result.status === 'complete') {
        await setActiveSignIn!({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Info', 'Additional steps required (e.g. MFA)');
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. EMAIL SIGN UP (Start) ---
  const handleEmailSignUp = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
    try {
      setLoading(true);
      await signUp!.create({ emailAddress: email, password });
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      // Instead of redirecting, we show the verification input
      setPendingVerification(true); 
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. VERIFY EMAIL CODE (Finish) ---
  const handleVerifyEmail = async () => {
    if (!code) return Alert.alert('Error', 'Please enter the verification code');
    try {
      setLoading(true);
      const result = await signUp!.attemptEmailAddressVerification({ code });
      
      if (result.status === 'complete') {
        await setActiveSignUp!({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <Ionicons name="medical" size={64} color="#0a7ea4" style={{ marginBottom: 20 }} />
              <ThemedText type="title" style={styles.title}>
                {pendingVerification ? 'Verify Email' : (isSignUp ? 'Create Account' : 'Welcome Back')}
              </ThemedText>
            </View>

            {/* --- VERIFICATION FORM --- */}
            {pendingVerification ? (
              <View style={styles.formContainer}>
                <ThemedText style={{ textAlign: 'center', marginBottom: 10 }}>
                  We sent a code to {email}
                </ThemedText>
                
                <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor }]}>
                  <Ionicons name="key-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="123456"
                    placeholderTextColor={placeholderColor}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyEmail} disabled={loading}>
                  <ThemedText style={styles.primaryButtonText}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setPendingVerification(false)} style={{ marginTop: 20 }}>
                  <ThemedText type="link" style={{ textAlign: 'center' }}>Back to Sign Up</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              /* --- LOGIN / SIGNUP FORM --- */
              <View style={styles.formContainer}>
                <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor }]}>
                  <Ionicons name="mail-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Email Address"
                    placeholderTextColor={placeholderColor}
                    value={email}
                    onChangeText={setEmail}
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

                <TouchableOpacity 
                  style={[styles.primaryButton, loading && { opacity: 0.6 }]} 
                  onPress={isSignUp ? handleEmailSignUp : handleEmailSignIn}
                  disabled={loading}
                >
                  <ThemedText style={styles.primaryButtonText}>
                    {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
                  </ThemedText>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                  <ThemedText style={styles.dividerText}>or continue with</ThemedText>
                  <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                </View>

                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={[styles.socialButton, { borderColor }]} 
                    onPress={() => handleSocialLogin('oauth_google')}
                    disabled={loading}
                  >
                    <Ionicons name="logo-google" size={24} color={textColor} />
                    <ThemedText style={styles.socialButtonText}>Google</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.socialButton, { borderColor }]} 
                    onPress={() => handleSocialLogin('oauth_apple')}
                    disabled={loading}
                  >
                    <Ionicons name="logo-apple" size={24} color={textColor} />
                    <ThemedText style={styles.socialButtonText}>Apple</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <ThemedText>{isSignUp ? 'Already have an account? ' : "Don't have an account? "}</ThemedText>
                  <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                    <ThemedText type="link">{isSignUp ? 'Log In' : 'Sign Up'}</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
  title: { textAlign: 'center' },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  formContainer: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16 },
  primaryButton: { backgroundColor: '#0a7ea4', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, opacity: 0.3 },
  dividerText: { marginHorizontal: 16, fontSize: 14, opacity: 0.6 },
  socialContainer: { flexDirection: 'row', gap: 16 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12, height: 50, gap: 8 },
  socialButtonText: { fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
});