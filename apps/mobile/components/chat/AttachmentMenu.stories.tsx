import React, { useState } from 'react';
import { View, Button } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { AttachmentMenu } from './AttachmentMenu';

const meta = {
  title: 'Chat/AttachmentMenu',
  component: AttachmentMenu,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AttachmentMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    visible: false,
    onClose: () => {},
    onSelect: () => {},
  },
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a24', justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Open Attachment Menu" onPress={() => setVisible(true)} />
        <AttachmentMenu 
          visible={visible} 
          onClose={() => setVisible(false)} 
          onSelect={(opt) => {
            console.log("Selected:", opt);
            setVisible(false);
          }} 
        />
      </View>
    );
  },
};
