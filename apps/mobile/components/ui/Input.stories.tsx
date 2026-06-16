import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: `
Input handles text entry with optional label, error state, and textarea variant.
Styled with the deep indigo glass aesthetic. Accepts no className — uses native style objects only.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Ask Omnia anything...' },
};

export const WithLabel: Story = {
  args: { label: 'System Prompt', placeholder: 'You are a helpful assistant...' },
};

export const Textarea: Story = {
  args: { placeholder: 'Write your message...', variant: 'textarea' },
};

export const WithError: Story = {
  args: {
    placeholder: 'API Key',
    error: true,
    errorMessage: 'Connection to provider lost. Check your API key.',
  },
};

export const Disabled: Story = {
  args: { placeholder: 'Not available', disabled: true },
};
