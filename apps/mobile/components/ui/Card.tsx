import React from 'react';
import { Pressable, View, Text, ViewStyle } from 'react-native';

/**
 * Card component for grouping related content.
 * 
 * @example
 * <Card padding="md">Content here</Card>
 */
interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Padding preset - controls internal spacing */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether card is interactive (clickable) */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onPress?: () => void;
  /** Additional styles for customization */
  style?: ViewStyle;
}

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ 
  children, 
  padding = 'md', 
  interactive = false,
  onPress,
  style 
}: CardProps) {
  const className = `rounded-lg border border-border bg-card ${paddingClasses[padding]}`;
  
  if (interactive && onPress) {
    return (
      <Pressable 
        className={className}
        onPress={onPress}
        style={style}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={className} style={style}>
      {children}
    </View>
  );
}

export default Card;
