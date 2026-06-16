import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Button is the primary interactive element in Omnia.

> **Architecture Note:** Components use React Native inline style objects (not NativeWind className / cva).
> See troubleshooting.md Issue 8 for why.

## Variants
- **default**: Primary indigo action (send message, confirm)
- **secondary**: Light indigo tint (cancel, secondary action)
- **outline**: Transparent with indigo border
- **ghost**: Minimal visual weight (links, tertiary)
- **destructive**: Red (delete, remove)

## Sizes
- **sm**: Compact (toolbars, inline)
- **md**: Standard (default)
- **lg**: Emphasized CTAs
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: <Text style={{ color: '#fff', fontWeight: '600' }}>Send Message</Text>,
    variant: 'default',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: <Text style={{ color: '#6366f1', fontWeight: '600' }}>Cancel</Text>,
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: <Text style={{ color: '#6366f1', fontWeight: '600' }}>Outline</Text>,
    variant: 'outline',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: <Text style={{ color: '#9d9bcc', fontWeight: '600' }}>Ghost</Text>,
    variant: 'ghost',
    size: 'md',
  },
};

export const Destructive: Story = {
  args: {
    children: <Text style={{ color: '#fff', fontWeight: '600' }}>Delete Conversation</Text>,
    variant: 'destructive',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: <Text style={{ color: '#fff', fontWeight: '600' }}>Sending...</Text>,
    variant: 'default',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: <Text style={{ color: '#fff', fontWeight: '600' }}>Disabled</Text>,
    variant: 'default',
    disabled: true,
  },
};
