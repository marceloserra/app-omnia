import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';

interface AvatarProps {
  src?: string;
  fallback?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'away';
  accessibilityLabel?: string;
}

const sizeMap = {
  sm: 32,
  md: 42,
  lg: 52,
};

const textSizeMap = {
  sm: 12,
  md: 14,
  lg: 17,
};

const statusColorMap = {
  online: '#22c55e',
  offline: '#9ca3af',
  away: '#eab308',
};

export function Avatar({ src, fallback, initials, size = 'md', status, accessibilityLabel }: AvatarProps) {
  const dim = sizeMap[size];
  const textSize = textSizeMap[size];
  const label = fallback || initials;

  const containerStyle: ViewStyle = {
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    backgroundColor: '#4338ca',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  };

  return (
    <View style={{ position: 'relative' }} accessibilityLabel={accessibilityLabel || label}>
      <View style={containerStyle}>
        {src ? (
          <Image source={{ uri: src }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
        ) : (
          <Text style={{ fontSize: textSize, fontWeight: '600', color: '#e0e7ff' }}>
            {label?.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </View>
      {status && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: statusColorMap[status],
          borderWidth: 2,
          borderColor: '#0f0e2a',
        }} />
      )}
    </View>
  );
}

export default Avatar;
