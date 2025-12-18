// components/auth/AuthInput.tsx
import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

interface AuthInputProps extends TextInputProps {
  iconName: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap; // [NEW] Optional right icon
  onRightIconPress?: () => void;                 // [NEW] Action for right icon
}

export function AuthInput({ iconName, rightIconName, onRightIconPress, style, ...props }: AuthInputProps) {
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const placeholderColor = useThemeColor({ light: '#9BA1A6', dark: '#9BA1A6' }, 'icon');
  const inputBgColor = useThemeColor({ light: '#f0f0f0', dark: '#1e1e1e' }, 'background');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');

  return (
    <View style={[styles.container, { backgroundColor: inputBgColor, borderColor }]}>
      <Ionicons name={iconName} size={20} color={placeholderColor} style={styles.icon} />
      
      <TextInput
        style={[styles.input, { color: textColor }, style]}
        placeholderTextColor={placeholderColor}
        {...props}
      />

      {/* [NEW] Render the right icon if provided */}
      {rightIconName && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconButton}>
          <Ionicons name={rightIconName} size={20} color={placeholderColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  // [NEW] Style for the touch target
  rightIconButton: {
    padding: 4,
  }
});