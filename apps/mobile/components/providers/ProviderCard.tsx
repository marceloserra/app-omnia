import React from 'react';
import { View, Text } from 'react-native';
import { Card, Avatar } from '../ui';

/**
 * ProviderCard component for AI provider selection.
 * 
 * @example
 * <ProviderCard name="OpenAI" description="GPT-4 models" isActive={true} />
 */
interface ProviderCardProps {
  /** Provider display name */
  name: string;
  /** Provider description/capabilities */
  description?: string;
  /** Whether this provider is currently active */
  isActive?: boolean;
  /** Selection handler */
  onPress?: () => void;
}

export function ProviderCard({ 
  name, 
  description, 
  isActive = false,
  onPress 
}: ProviderCardProps) {
  return (
    <Card 
      padding="md"
      interactive={true}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <Avatar 
          initials={name.substring(0, 2).toUpperCase()} 
          size="md"
          accessibilityLabel={`${name} provider avatar`}
        />
        
        <View className="flex-1 minw-0">
          <Text className="text-base font-semibold text-foreground">{name}</Text>
          
          {description && (
            <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
        
        {/* Active indicator */}
        {isActive && (
          <View className="w-3 h-3 rounded-full bg-primary" />
        )}
      </View>
    </Card>
  );
}

export default ProviderCard;
