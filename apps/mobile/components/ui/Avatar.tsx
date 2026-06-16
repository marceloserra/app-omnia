import React from 'react';
import { View, Text, Image } from 'react-native';

/**
 * Avatar component for user or model representation.
 * 
 * @example
 * <Avatar initials="GPT-4" size="md" />
 */
interface AvatarProps {
  /** Profile image URL */
  image?: string;
  /** Initials when no image provided */
  initials?: string;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** Status indicator (online, offline, away) */
  status?: 'online' | 'offline' | 'away';
  /** Accessibility label */
  accessibilityLabel?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

export function Avatar({
  image,
  initials,
  size = 'md',
  status,
  accessibilityLabel,
}: AvatarProps) {
  const dimensions = sizeMap[size];

  return (
    <View 
      className={`relative inline-flex items-center justify-center rounded-full bg-muted ${dimensions.container}`}
      accessibilityLabel={accessibilityLabel || initials}
    >
      {image ? (
        <Image 
          source={{ uri: image }} 
          className="w-full h-full rounded-full"
        />
      ) : (
        <Text className={`${dimensions.text} font-medium text-muted-foreground`}>
          {initials?.slice(0, 2).toUpperCase()}
        </Text>
      )}
      
      {status && (
        <View 
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColors[status]}`}
        />
      )}
    </View>
  );
}

export default Avatar;
