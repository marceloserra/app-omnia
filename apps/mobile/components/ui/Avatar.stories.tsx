import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Avatar displays a user or AI model identity. Shows an image if \`src\` is provided, otherwise falls back to initials.

## Props
- **fallback/initials**: Text initials (max 2 chars shown)
- **src**: Remote image URI
- **size**: sm (32) | md (42) | lg (52)
- **status**: online | offline | away dot indicator
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  args: { fallback: 'AI', size: 'md' },
};

export const WithStatus: Story = {
  args: { fallback: 'AI', size: 'md', status: 'online' },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Avatar fallback="S" size="sm" />
      <Avatar fallback="MD" size="md" />
      <Avatar fallback="LG" size="lg" />
    </View>
  ),
};

export const Statuses: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Avatar fallback="ON" size="md" status="online" />
      <Avatar fallback="AW" size="md" status="away" />
      <Avatar fallback="OF" size="md" status="offline" />
    </View>
  ),
};
