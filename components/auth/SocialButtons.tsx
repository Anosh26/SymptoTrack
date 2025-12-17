// anosh26/symptotrack/SymptoTrack-UI/components/auth/SocialButtons.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SocialButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  isLoading: boolean;
}

export function SocialButtons({ onGooglePress, onApplePress, isLoading }: SocialButtonsProps) {
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, { borderColor }]} 
        onPress={onGooglePress}
        disabled={isLoading}
      >
        <Ionicons name="logo-google" size={24} color={textColor} />
        <ThemedText style={styles.text}>Google</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { borderColor }]} 
        onPress={onApplePress}
        disabled={isLoading}
      >
        <Ionicons name="logo-apple" size={24} color={textColor} />
        <ThemedText style={styles.text}>Apple</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
});