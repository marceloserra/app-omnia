import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Primitives/Sheet',
  component: Sheet,
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Button title="Open Sheet" onPress={() => setOpen(true)} />
        <Sheet open={open} onDismiss={() => setOpen(false)} title="Example Sheet">
          <Text>This is the content inside the bottom sheet.</Text>
        </Sheet>
      </View>
    );
  },
};
