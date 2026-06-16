import React from 'react';
import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <Text>Basic Card Content</Text>,
    padding: 'md',
  },
};

export const Interactive: Story = {
  args: {
    children: <Text>Tap Me</Text>,
    padding: 'md',
    interactive: true,
    onPress: () => alert('Card tapped!'),
  },
};

export const Elevated: Story = {
  args: {
    children: <Text>Elevated Card</Text>,
    padding: 'lg',
    elevation: 'sm',
  },
};
