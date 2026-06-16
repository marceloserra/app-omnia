import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Avatar, Divider } from '../ui';

/**
 * ConversationItem component for conversation list in drawer.
 * 
 * @example
 * <ConversationItem title="Project Discussion" preview="Last message..." isActive={true} />
 */
interface ConversationItemProps {
  /** Conversation title */
  title: string;
  /** Preview text from last message */
  preview?: string;
  /** Whether this conversation is currently active */
  isActive?: boolean;
  /** Timestamp for display */
  timestamp?: number;
  /** Model used in conversation */
  model?: string;
  /** Selection handler */
  onPress?: () => void;
}

export function ConversationItem({ 
  title, 
  preview, 
  isActive = false,
  timestamp,
  model,
  onPress 
}: ConversationItemProps) {
  return (
    <Pressable 
      className={`flex flex-col px-4 py-3 ${isActive ? 'bg-accent' : ''}`}
      onPress={onPress}
      accessibilityLabel={`${title} conversation`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          <Avatar 
            initials={model?.split('-')[0] || 'C'} 
            size="sm"
            accessibilityLabel={`${model || 'Conversation'} avatar`}
          />
          
          <View className="flex-1 minw-0">
            <Text 
              className={`text-base font-medium truncate ${isActive ? 'text-accent-foreground' : 'text-foreground'}`}
              numberOfLines={1}
            >
              {title}
            </Text>
            
            {preview && (
              <Text 
                className="text-sm text-muted-foreground truncate"
                numberOfLines={1}
              >
                {preview}
              </Text>
            )}
          </View>
        </View>
        
        {timestamp && (
          <Text className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </Text>
        )}
      </View>
      
      {/* Active indicator */}
      {isActive && (
        <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
      )}
    </Pressable>
  );
}

export default ConversationItem;
