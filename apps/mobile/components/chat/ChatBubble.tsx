import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '../ui';

/**
 * ChatBubble component for displaying messages in conversation.
 * 
 * @example
 * <ChatBubble role="user" content="Hello!" timestamp={Date.now()} />
 */
interface ChatBubbleProps {
  /** Message sender - user or assistant */
  role: 'user' | 'assistant';
  /** Message text content */
  content: string;
  /** Timestamp for display */
  timestamp?: number;
  /** Model name (for assistant messages) */
  model?: string;
}

export function ChatBubble({ 
  role, 
  content, 
  timestamp, 
  model 
}: ChatBubbleProps) {
  const isUser = role === 'user';
  
  return (
    <View className={`flex flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar 
          initials={model?.split('-')[0] || 'AI'} 
          size="sm"
          accessibilityLabel={`${model || 'Assistant'} avatar`}
        />
      )}
      
      <View className={`max-w-[75%] ${isUser ? 'ml-8' : 'mr-2'}`}>
        {/* Model name for assistant messages */}
        {!isUser && model && (
          <Text className="text-xs text-muted-foreground mb-1">{model}</Text>
        )}
        
        {/* Message bubble */}
        <View 
          className={`rounded-lg px-4 py-3 ${
            isUser 
              ? 'bg-primary/10 border border-border' 
              : 'bg-card border border-border'
          }`}
        >
          <Text className="text-base text-foreground">{content}</Text>
        </View>
        
        {/* Timestamp */}
        {timestamp && (
          <Text className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
      
      {isUser && (
        <Avatar 
          initials="You" 
          size="sm"
          accessibilityLabel="Your avatar"
        />
      )}
    </View>
  );
}

export default ChatBubble;
