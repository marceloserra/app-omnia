import React from 'react';
import { Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import { cva } from 'class-variance-authority';

/**
 * Button component with variant and size support.
 * 
 * @example
 * <Button variant="primary" onPress={() => console.log('pressed')}>Send</Button>
 */
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onPress?: () => void;
  /** Button visual style - affects color and border */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Button dimensions preset */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state shows spinner instead of children */
  loading?: boolean;
  /** Disabled state prevents interaction */
  disabled?: boolean;
  /** Additional styles for customization */
  style?: ViewStyle;
}

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  style 
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      className={buttonVariants({ variant, size })}
      style={style}
    >
      {loading ? (
        <ActivityIndicator size="small" color="currentColor" />
      ) : (
        children
      )}
    </Pressable>
  );
}

export default Button;
