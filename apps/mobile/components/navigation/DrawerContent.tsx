import React from 'react';
import { Pressable, View, Text, FlatList } from 'react-native';
import { useNavigation } from 'expo-router';
import type { NavigationProp } from '@react-navigation/native';
import { Divider } from '@/components/ui';
import { ConversationItem } from '@/components/chat';

/**
 * Drawer content component - conversation list and navigation.
 */
export function DrawerContent() {
  const navigation = useNavigation<NavigationProp<any>>();
  
  // Mock conversations for drawer display
  const conversations = [
    { id: '1', title: 'Project Discussion', preview: 'What about the API design?', timestamp: Date.now(), model: 'GPT-4' },
    { id: '2', title: 'Code Review', preview: 'The implementation looks good', timestamp: Date.now() - 86400000, model: 'Claude' },
    { id: '3', title: 'Research Help', preview: 'Can you explain quantum computing?', timestamp: Date.now() - 172800000, model: 'Gemini' },
  ];

  const handleConversationPress = (id: string) => {
    // Navigate to conversation and close drawer
    navigation.navigate('index');
  };

  return (
    <View className="flex-1 bg-background">
      {/* Drawer Header */}
      <View className="px-4 py-6 border-b border-border">
        <Text className="text-xl font-bold text-foreground mb-2">Omnia</Text>
        <Text className="text-sm text-muted-foreground">AI Conversations</Text>
      </View>

      {/* New Conversation Button */}
      <View className="px-4 py-3">
        <Pressable 
          className="flex-row items-center gap-2 px-3 py-2 rounded-md bg-accent"
          onPress={() => navigation.navigate('index')}
        >
          <Text className="text-base text-accent-foreground">+</Text>
          <Text className="text-base font-medium text-accent-foreground">New Conversation</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <Divider />

      {/* Conversation List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem 
            title={item.title}
            preview={item.preview}
            timestamp={item.timestamp}
            model={item.model}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
      />

      {/* Settings Link */}
      <Divider />
      
      <Pressable 
        className="px-4 py-3"
        onPress={() => navigation.navigate('settings')}
      >
        <Text className="text-base font-medium text-muted-foreground">Settings</Text>
      </Pressable>
    </View>
  );
}

export default DrawerContent;
