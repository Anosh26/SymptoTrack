import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router'; // Added useRouter
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react'; // Added hooks
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};
const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};
export default function RootLayout() {
  
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // MOCK AUTHENTICATION STATE
  // In a real app, this would come from your Auth Context (e.g., Firebase/Supabase)
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      // If the app is ready and user is NOT logged in, go to Login
      router.replace('/login');
    }
  }, [isMounted, isAuthenticated]);

  return (<ClerkProvider 
      publishableKey="pk_test_cG9wdWxhci1lbGYtNDEuY2xlcmsuYWNjb3VudHMuZGV2JA"
      tokenCache={tokenCache}
    >
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* We keep (tabs) as the main entry, but the useEffect above guards it */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Register the login screen so the router knows about it */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </ClerkProvider>
  );
  
}