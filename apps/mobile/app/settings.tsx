import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Divider, Sheet } from '@/components/ui';
import { SettingsRow } from '@/components/settings';
import { ModelSelector } from '@/components/model';

/**
 * Settings screen - provider configuration and app preferences.
 */
export default function SettingsScreen() {
  const [showModelSheet, setShowModelSheet] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('openai');
  
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border">
        <Text className="text-xl font-bold text-foreground">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Provider Selection Card */}
        <Card padding="md" interactive onPress={() => setShowModelSheet(true)}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-foreground">AI Provider</Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {activeProvider === 'openai' ? 'OpenAI - GPT-4' : 
                 activeProvider === 'anthropic' ? 'Anthropic - Claude' : 
                 activeProvider === 'google' ? 'Google - Gemini' : activeProvider}
              </Text>
            </View>
            <Text className="text-base text-muted-foreground">›</Text>
          </View>
        </Card>

        {/* Model Settings */}
        <Divider />
        
        <SettingsRow 
          label="Temperature" 
          value={0.7}
          description="Controls randomness (0 = deterministic, 1 = creative)"
        />
        
        <SettingsRow 
          label="Max Tokens" 
          value={2048}
          description="Maximum response length"
        />

        {/* Appearance Settings */}
        <Divider />
        
        <SettingsRow 
          label="Theme" 
          value="System"
          description="Follow system dark/light mode preference"
        />

        {/* About Section */}
        <Divider />
        
        <Card padding="md">
          <Text className="text-sm text-muted-foreground">
            Omnia Mobile v0.1.0{'\n'}
            Powered by llama.cpp and local AI models
          </Text>
        </Card>
      </ScrollView>

      {/* Model Selection Sheet */}
      <Sheet 
        open={showModelSheet} 
        onDismiss={() => setShowModelSheet(false)}
        title="Select Provider"
        height="half"
      >
        <ModelSelector 
          onSelect={(provider) => {
            setActiveProvider(provider);
            setShowModelSheet(false);
          }}
          activeProvider={activeProvider}
        />
      </Sheet>
    </View>
  );
}
