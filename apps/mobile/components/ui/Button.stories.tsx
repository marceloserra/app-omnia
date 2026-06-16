import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Button is the primary interactive element for actions in Omnia. It supports multiple variants and sizes to accommodate different contexts.

## Variants
- **primary**: Main action buttons (send message, confirm)
- **secondary**: Supporting actions (cancel, back)
- **ghost**: Minimal visual weight (icon buttons, links)
- **destructive**: Destructive actions (delete, remove)

## Sizes
- **sm**: Compact spaces (toolbars, inline)
- **md**: Standard size (default)
- **lg**: Emphasized actions (primary CTAs)

## States
- Default: Normal interactive state
- Loading: Shows spinner, disables interaction
- Disabled: Non-interactive, reduced opacity
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Send Message',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Settings',
    variant: 'ghost',
    size: 'md',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Conversation',
    variant: 'destructive',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Sending...',
    variant: 'primary',
    loading: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </>
  ),
};
