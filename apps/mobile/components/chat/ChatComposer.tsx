import React, { useState } from 'react';
import { View, Keyboard } from 'react-native';
import { Input, Button } from '../ui';

/**
 * ChatComposer component for message input with send action.
 * 
 * @example
 * <ChatComposer onSend={handleSend} disabled={false} />
 */
interface ChatComposerProps {
  /** Send handler - receives message text */
  onSend: (message: string) => void;
  /** Disabled state when waiting for response */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

export function ChatComposer({ 
  onSend, 
  disabled = false,
  placeholder = "Type a message..." 
}: ChatComposerProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      Keyboard.dismiss();
    }
  };

  return (
    <View className="flex-row items-center gap-2 p-4 border-t border-border bg-background">
      <Input 
        variant="text"
        placeholder={placeholder}
        value={message}
        onChangeText={setMessage}
        disabled={disabled}
        containerStyle={{ flex: 1 }}
      />
      
      <Button 
        onPress={handleSend}
        disabled={!message.trim() || disabled}
        variant="primary"
        size="md"
      >
        Send
      </Button>
    </View>
  );
}

export default ChatComposer;
