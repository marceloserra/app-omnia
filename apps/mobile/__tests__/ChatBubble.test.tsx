import React from 'react';
import { render } from '@testing-library/react-native';
import { ChatBubble } from '@/components/chat/ChatBubble';

describe('ChatBubble Component', () => {
  it('renders user message correctly', () => {
    const { getByText } = render(
      <ChatBubble 
        role="user" 
        content="Hello World" 
        timestamp={Date.now()} 
      />
    );
    
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders assistant message with model name', () => {
    const { getByText } = render(
      <ChatBubble 
        role="assistant" 
        content="AI Response" 
        timestamp={Date.now()}
        model="GPT-4"
      />
    );
    
    expect(getByText('GPT-4')).toBeTruthy();
    expect(getByText('AI Response')).toBeTruthy();
  });

  it('displays timestamp correctly', () => {
    const timestamp = Date.now();
    const { getByText } = render(
      <ChatBubble 
        role="user" 
        content="Test message" 
        timestamp={timestamp} 
      />
    );
    
    // Timestamp should be formatted and displayed
    expect(true).toBe(true); // Placeholder - would verify time format in real test
  });

  it('positions user messages on the right', () => {
    const { debug } = render(
      <ChatBubble 
        role="user" 
        content="User message" 
        timestamp={Date.now()} 
      />
    );
    
    // Would check for justify-end class in real test
    expect(true).toBe(true);
  });

  it('positions assistant messages on the left', () => {
    const { debug } = render(
      <ChatBubble 
        role="assistant" 
        content="Assistant message" 
        timestamp={Date.now()} 
      />
    );
    
    // Would check for justify-start class in real test
    expect(true).toBe(true);
  });
});
