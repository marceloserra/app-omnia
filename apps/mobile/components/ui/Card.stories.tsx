import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: `
Card groups related content in a dark indigo glassmorphism container with a subtle glow border.

## Props
- **padding**: none | sm | md | lg — controls inner spacing
- **interactive**: when true + onPress, renders as Pressable with opacity feedback
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    padding: 'md',
    children: <Text style={{ color: '#f0efff' }}>Card content here</Text>,
  },
};

export const Interactive: Story = {
  args: {
    padding: 'md',
    interactive: true,
    onPress: () => console.log('Card pressed'),
    children: <Text style={{ color: '#f0efff' }}>Tap me</Text>,
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Card padding="sm"><Text style={{ color: '#f0efff' }}>Small padding</Text></Card>
      <Card padding="md"><Text style={{ color: '#f0efff' }}>Medium padding (default)</Text></Card>
      <Card padding="lg"><Text style={{ color: '#f0efff' }}>Large padding</Text></Card>
    </View>
  ),
};
