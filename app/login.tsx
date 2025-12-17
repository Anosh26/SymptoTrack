// anosh26/symptotrack/SymptoTrack-UI/app/login.tsx
import * as WebBrowser from 'expo-web-browser';
import { useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
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

// UI Components
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { AuthInput } from '@/components/auth/AuthInput';
import { SocialButtons } from '@/components/auth/SocialButtons';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  
  // Logic State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clerk Hooks
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  // --- HANDLERS ---
  
  const handleSocialLogin = async (strategy: 'oauth_google' | 'oauth_apple') => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const msg = err.errors?.[0]?.message || 'Social login failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    try {
      setLoading(true);
      const result = await signIn!.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActiveSignIn!({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Info', 'Additional steps required (MFA)');
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    try {
      setLoading(true);
      await signUp!.create({ emailAddress: email, password });
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!code) return Alert.alert('Error', 'Please enter the code');
    try {
      setLoading(true);
      const result = await signUp!.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActiveSignUp!({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Verification invalid');
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed');
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
                {pendingVerification ? 'Verify Email' : (isSignUp ? 'Create Account' : 'Welcome Back')}
              </ThemedText>
            </View>

            {pendingVerification ? (
              // --- VERIFICATION VIEW ---
              <View style={styles.formContainer}>
                <ThemedText style={styles.centerText}>Enter the code sent to {email}</ThemedText>
                
                <AuthInput 
                  iconName="key-outline" 
                  placeholder="123456" 
                  value={code} 
                  onChangeText={setCode} 
                  keyboardType="number-pad" 
                />

                <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyEmail} disabled={loading}>
                  <ThemedText style={styles.primaryButtonText}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.linkButton}>
                  <ThemedText type="link">Back to Sign Up</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              // --- MAIN LOGIN/SIGNUP VIEW ---
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
                  onPress={isSignUp ? handleEmailSignUp : handleEmailSignIn}
                  disabled={loading}
                >
                  <ThemedText style={styles.primaryButtonText}>
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                  </ThemedText>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                  <ThemedText style={styles.dividerText}>or continue with</ThemedText>
                  <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                </View>

                <SocialButtons 
                  isLoading={loading}
                  onGooglePress={() => handleSocialLogin('oauth_google')}
                  onApplePress={() => handleSocialLogin('oauth_apple')}
                />

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
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { textAlign: 'center' },
  formContainer: { gap: 4 },
  centerText: { textAlign: 'center', marginBottom: 20 },
  primaryButton: { backgroundColor: '#0a7ea4', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, opacity: 0.3 },
  dividerText: { marginHorizontal: 16, fontSize: 14, opacity: 0.6 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
});