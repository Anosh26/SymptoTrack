import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router'; 
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo'; // Import useAuth
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react'; 
import 'react-native-reanimated';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider 
      publishableKey="pk_test_cG9wdWxhci1lbGYtNDEuY2xlcmsuYWNjb3VudHMuZGV2JA" 
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <RootLayoutNav colorScheme={colorScheme} />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function RootLayoutNav({ colorScheme }: { colorScheme: any }) {
  const { isLoaded, isSignedIn } = useAuth(); // Use Clerk's real state
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (isSignedIn && !inTabsGroup) {
      // If logged in, go to tabs
      router.replace('/(tabs)');
    } else if (!isSignedIn) {
      // If not logged in, go to login
      router.replace('/login');
    }
  }, [isSignedIn, isLoaded]); // Removed segments to avoid loops

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}