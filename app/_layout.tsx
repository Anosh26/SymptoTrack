// anosh26/symptotrack/SymptoTrack-UI/app/_layout.tsx
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router'; 
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments(); 
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // --- DEBUG LOGS (Check your terminal!) ---
    console.log("Auth Debug:", { 
      isSignedIn, 
      currentRoute: segments 
    });

    const inTabsGroup = segments[0] === '(tabs)';
    const inLoginRoute = segments[0] === 'login';

    if (isSignedIn && !inTabsGroup) {
      // 1. If User is logged in, but NOT in tabs -> Go to Tabs
      console.log("Redirecting to Tabs...");
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inLoginRoute) {
      // 2. If User is NOT logged in, and NOT on login screen -> Go to Login
      console.log("Redirecting to Login...");
      router.replace('/login');
    }
  }, [isSignedIn, isLoaded, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider 
      publishableKey="pk_test_cG9wdWxhci1lbGYtNDEuY2xlcmsuYWNjb3VudHMuZGV2JA"
      tokenCache={tokenCache}
    >
      <ClerkLoaded> 
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
           <InitialLayout /> 
           <StatusBar style="auto" />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}