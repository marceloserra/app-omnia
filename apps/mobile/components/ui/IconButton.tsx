import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

/**
 * IconButton component for icon-only interactions.
 * 
 * @example
 * <IconButton icon={Settings} size="md" />
 */
interface IconButtonProps {
  /** Icon component from lucide-react-native */
  icon: LucideIcon;
  /** Button size - affects icon size and padding */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant for styling */
  variant?: 'default' | 'ghost' | 'destructive';
  /** Click handler */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Additional styles */
  style?: ViewStyle;
}

const sizeMap = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
};

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
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
  const variantClasses = {
    default: '',
    ghost: 'hover:bg-accent',
    destructive: 'text-destructive hover:bg-destructive/10',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel || 'Button'}
      className={`inline-flex items-center justify-center rounded-md ${sizeMap[size]} ${variantClasses[variant]} disabled:opacity-50`}
      style={style}
    >
      <Icon size={iconSizeMap[size]} color="currentColor" />
    </Pressable>
  );
}

export default IconButton;
