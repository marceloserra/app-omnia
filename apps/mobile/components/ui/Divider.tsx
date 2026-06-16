import React from 'react';
import { View } from 'react-native';

/**
 * Divider component for visual separation between sections.
 * 
 * @example
 * <Divider orientation="horizontal" />
 */
interface DividerProps {
  /** Orientation of divider - horizontal or vertical */
  orientation?: 'horizontal' | 'vertical';
  /** Additional classes for styling */
  className?: string;
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  const baseClasses = 'bg-border';
  
  if (orientation === 'horizontal') {
    return (
      <View className={`${baseClasses} h-px w-full ${className}`} />
    );
  }

  return (
    <View className={`${baseClasses} w-px h-full ${className}`} />
  );
}

export default Divider;
