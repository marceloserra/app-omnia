import type { Meta, StoryObj } from '@storybook/react';
import { ModelSelector } from './ModelSelector';

const meta: Meta<typeof ModelSelector> = {
  title: 'Composed/ModelSelector',
  component: ModelSelector,
};

export default meta;

type Story = StoryObj<typeof ModelSelector>;

export const Default: Story = {
  args: {
    activeProvider: 'openai',
    onSelect: (provider) => alert(`Selected: ${provider}`),
  },
};
