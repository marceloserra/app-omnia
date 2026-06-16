import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Input, Card } from '../ui';
import { ProviderCard } from '../providers';

/**
 * ModelSelector component for model selection interface.
 * 
 * @example
 * <ModelSelector onSelect={handleSelect} />
 */
interface ModelSelectorProps {
  /** Selection handler - receives selected provider/model */
  onSelect: (provider: string, model?: string) => void;
  /** Currently active provider */
  activeProvider?: string;
}

// Mock data for demonstration
const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4 and GPT-3.5 models' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude AI models' },
  { id: 'google', name: 'Google', description: 'Gemini models' },
];

export function ModelSelector({ 
  onSelect, 
  activeProvider 
}: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProviders = PROVIDERS.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1">
      {/* Search */}
      <Input 
        label="Search providers"
        variant="search"
        placeholder="Filter by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Provider List */}
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProviderCard 
            name={item.name}
            description={item.description}
            isActive={activeProvider === item.id}
            onPress={() => onSelect(item.id)}
          />
        )}
        contentContainerStyle={{ padding: 16, gap: 8 }}
      />
    </View>
  );
}

export default ModelSelector;
