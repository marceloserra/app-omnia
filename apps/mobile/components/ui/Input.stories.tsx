import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Type a message...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Hello World',
  },
};

export const ErrorState: Story = {
  args: {
    placeholder: 'Invalid input',
    error: 'This field is required',
  },
};
