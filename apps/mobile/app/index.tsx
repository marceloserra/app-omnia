import React from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-xl font-medium text-foreground">Chat Placeholder</Text>
      <Text className="text-sm text-muted-foreground mt-2">Implementation deferred to Phase 5</Text>
    </View>
  );
}
