import type { Meta, StoryObj } from '@storybook/react';
import { ChatComposer } from './ChatComposer';

const meta: Meta<typeof ChatComposer> = {
  title: 'Composed/ChatComposer',
  component: ChatComposer,
};

export default meta;

type Story = StoryObj<typeof ChatComposer>;

export const Default: Story = {
  args: {
    onSend: (message) => alert(`Sent: ${message}`),
  },
};
