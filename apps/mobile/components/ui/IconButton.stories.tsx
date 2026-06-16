import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Primitives/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    icon: 'home',
    size: 'md',
  },
};

export const Variants: Story = {
  render: () => (
    <>
      <IconButton icon="star" variant="primary" />
      <IconButton icon="star" variant="secondary" />
      <IconButton icon="star" variant="ghost" />
    </>
  ),
};
