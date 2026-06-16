import React from 'react';
import { Pressable, ActivityIndicator, ViewStyle, Text, View } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
  testID?: string;
}

const variantStyles: Record<string, ViewStyle> = {
  default: { backgroundColor: '#6366f1' },
  secondary: { backgroundColor: '#e0e7ff' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#6366f1' },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: '#ef4444' },
};

const sizeStyles: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  md: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  lg: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
};

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  testID,
}: ButtonProps) {
  const opacity = disabled || loading ? 0.5 : 1;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : opacity,
        },
        variantStyles[variant],
        sizeStyles[size],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        children
      )}
    </Pressable>
  );
}

export default Button;
