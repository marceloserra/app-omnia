import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from './ChatBubble';

const meta: Meta<typeof ChatBubble> = {
  title: 'Composed/ChatBubble',
  component: ChatBubble,
};

export default meta;

type Story = StoryObj<typeof ChatBubble>;

export const UserMessage: Story = {
  args: {
    role: 'user',
    content: 'Can you explain quantum computing simply?',
    timestamp: Date.now(),
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    content: 'Quantum computing is a new way for computers to process information using qubits...',
    timestamp: Date.now(),
    model: 'GPT-4',
  },
};
