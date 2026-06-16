import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { ChatBubble, ChatComposer, ConversationItem } from '@/components/chat';

/**
 * Main conversation screen - displays active chat or conversation list.
 */
export default function HomeScreen() {
  const navigation = useNavigation();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Mock conversations data
  const conversations = [
    { id: '1', title: 'Project Discussion', preview: 'What about the API design?', timestamp: Date.now(), model: 'GPT-4' },
    { id: '2', title: 'Code Review', preview: 'The implementation looks good', timestamp: Date.now() - 86400000, model: 'Claude' },
    { id: '3', title: 'Research Help', preview: 'Can you explain quantum computing?', timestamp: Date.now() - 172800000, model: 'Gemini' },
  ];

  // Mock messages for active conversation
  const messages = [
    { id: '1', role: 'user' as const, content: 'Hello! Can you help me with my project?', timestamp: Date.now() - 3600000, model: 'GPT-4' },
    { id: '2', role: 'assistant' as const, content: 'Of course! I\'d be happy to help. What kind of project are you working on?', timestamp: Date.now() - 3500000, model: 'GPT-4' },
  ];

  const handleSendMessage = (message: string) => {
    // TODO: Implement message sending logic
    console.log('Sending message:', message);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header with drawer toggle */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={openDrawer}>
          <Text className="text-lg font-semibold text-foreground">☰</Text>
        </TouchableOpacity>
        
        {activeConversationId ? (
          <Text className="text-base font-medium text-foreground">Chat</Text>
        ) : (
          <Text className="text-base font-medium text-foreground">Conversations</Text>
        )}
        
        <View style={{ width: 24 }} /> {/* Spacer for centering */}
      </View>

      {/* Content area - either conversation list or active chat */}
      {activeConversationId ? (
        // Active Chat View
        <>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble 
                role={item.role} 
                content={item.content} 
                timestamp={item.timestamp}
                model={item.model}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
          />
          
          <ChatComposer onSend={handleSendMessage} />
        </>
      ) : (
        // Conversation List View
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem 
              title={item.title}
              preview={item.preview}
              timestamp={item.timestamp}
              model={item.model}
              onPress={() => setActiveConversationId(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}
