import React from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Primitives/Divider',
  component: Divider,
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <View style={{ width: 300, gap: 16 }}>
      <Text>Above Divider</Text>
      <Divider />
      <Text>Below Divider</Text>
    </View>
  ),
};

export const WithSpacing: Story = {
  render: () => (
    <View style={{ width: 300 }}>
      <Text>Above Divider</Text>
      <Divider spacing="lg" />
      <Text>Below Divider</Text>
    </View>
  ),
};
