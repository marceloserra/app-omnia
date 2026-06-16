import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { IconButton } from './IconButton';
import { Send, Settings, Trash2, Star } from 'lucide-react-native';

const meta: Meta<typeof IconButton> = {
  title: 'Primitives/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
IconButton renders a circular pressable with a lucide-react-native icon.
Requires \`react-native-svg\` as a peer dependency.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: { icon: Send, variant: 'default', accessibilityLabel: 'Send' },
};

export const Outline: Story = {
  args: { icon: Settings, variant: 'outline', accessibilityLabel: 'Settings' },
};

export const Ghost: Story = {
  args: { icon: Star, variant: 'ghost', accessibilityLabel: 'Favorite' },
};

export const Destructive: Story = {
  args: { icon: Trash2, variant: 'destructive', accessibilityLabel: 'Delete' },
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <IconButton icon={Send} variant="default" accessibilityLabel="Send" />
      <IconButton icon={Settings} variant="outline" accessibilityLabel="Settings" />
      <IconButton icon={Star} variant="ghost" accessibilityLabel="Star" />
      <IconButton icon={Trash2} variant="destructive" accessibilityLabel="Delete" />
    </View>
  ),
};
