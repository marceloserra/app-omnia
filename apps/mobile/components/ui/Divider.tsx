import React from 'react';
import { View, ViewStyle } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  className?: string;
}

export function Divider({ orientation = 'horizontal', style }: DividerProps) {
  const isVertical = orientation === 'vertical';

  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderRadius: 1,
          ...(isVertical ? { width: 1, alignSelf: 'stretch' } : { height: 1, width: '100%' }),
        },
        style,
      ]}
    />
  );
}

export default Divider;
