import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { AttachmentPill } from './AttachmentPill';

const meta = {
  title: 'Chat/AttachmentPill',
  component: AttachmentPill,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <View style={{ backgroundColor: '#05050f', padding: 20, flex: 1, justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof AttachmentPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageAttachment: Story = {
  args: {
    attachment: {
      uri: 'https://images.unsplash.com/photo-1605379399642-870262d3d051',
      type: 'image',
      name: 'photo.jpg',
    },
    onRemove: () => console.log('Removed'),
  },
};

export const DocumentAttachment: Story = {
  args: {
    attachment: {
      uri: 'file:///path/to/document.pdf',
      type: 'document',
      name: 'Project_Proposal_Final_v2.pdf',
      size: 1024 * 1024 * 2.5, // 2.5MB
    },
    onRemove: () => console.log('Removed'),
  },
};
