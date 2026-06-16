import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const paddingMap = { none: 0, sm: 8, md: 16, lg: 24 };

const baseStyle: ViewStyle = {
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.2)',
  backgroundColor: '#1e1b4b',
  shadowColor: '#6366f1',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 4,
};

export function Card({ children, padding = 'md', interactive = false, onPress, style }: CardProps) {
  const containerStyle: ViewStyle = {
    ...baseStyle,
    padding: paddingMap[padding],
    ...style,
  };

  if (interactive && onPress) {
    return (
      <Pressable style={({ pressed }) => [containerStyle, { opacity: pressed ? 0.9 : 1 }]} onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

export default Card;
