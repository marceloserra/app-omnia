import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Primitives/Divider',
  component: Divider,
  parameters: {
    docs: {
      description: {
        component: `Divider renders a subtle 1px indigo-tinted separator line for separating content sections inside Cards or Lists.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <View style={{ width: 300, padding: 16, backgroundColor: '#13112a' }}>
      <Divider />
    </View>
  ),
};

export const Vertical: Story = {
  render: () => (
    <View style={{ height: 60, flexDirection: 'row', padding: 16, backgroundColor: '#13112a', alignItems: 'center' }}>
      <Divider orientation="vertical" />
    </View>
  ),
};
