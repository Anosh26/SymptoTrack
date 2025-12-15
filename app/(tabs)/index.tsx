import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native'; // Added TouchableOpacity

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router'; // Ensure Link is imported

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* --- ADD THIS SECTION START --- */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Test Authentication</ThemedText>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Open Login Screen</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
      {/* --- ADD THIS SECTION END --- */}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      {/* ... rest of your code ... */}
    </ParallaxScrollView>
  );
}

// Add these to your StyleSheet at the bottom
const styles = StyleSheet.create({
  // ... existing styles ...
  button: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // ... existing styles ...
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});