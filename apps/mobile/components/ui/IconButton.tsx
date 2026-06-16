import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface IconButtonProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

const sizeMap = { sm: 28, md: 36, lg: 44 };
const iconSizeMap = { sm: 14, md: 18, lg: 22 };

const variantStyles: Record<string, ViewStyle> = {
  default: { backgroundColor: '#6366f1' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#6366f1' },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: '#ef4444' },
};

const iconColorMap: Record<string, string> = {
  default: '#ffffff',
  outline: '#6366f1',
  ghost: '#a5b4fc',
  destructive: '#ffffff',
};

export function IconButton({
  icon: Icon,
  size = 'md',
  variant = 'default',
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const dim = sizeMap[size];
  const iconSize = iconSizeMap[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel || 'Button'}
      style={({ pressed }) => [
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.75 : disabled ? 0.4 : 1,
        },
        variantStyles[variant],
        style,
      ]}
    >
      <Icon size={iconSize} color={iconColorMap[variant]} />
    </Pressable>
  );
}

export default IconButton;
