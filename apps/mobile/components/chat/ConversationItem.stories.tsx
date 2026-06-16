import type { Meta, StoryObj } from '@storybook/react';
import { ConversationItem } from './ConversationItem';

const meta: Meta<typeof ConversationItem> = {
  title: 'Composed/ConversationItem',
  component: ConversationItem,
};

export default meta;

type Story = StoryObj<typeof ConversationItem>;

export const Default: Story = {
  args: {
    title: 'Project Discussion',
    preview: 'What about the API design?',
    timestamp: Date.now(),
    model: 'GPT-4',
    onPress: () => alert('Conversation tapped!'),
  },
};
