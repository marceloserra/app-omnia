import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    initials: 'AI',
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    image: 'https://github.com/identicons/bot.png',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <>
      <Avatar initials="SM" size="sm" />
      <Avatar initials="MD" size="md" />
      <Avatar initials="LG" size="lg" />
    </>
  ),
};

export const WithStatus: Story = {
  args: {
    initials: 'JD',
    size: 'md',
    status: 'online',
  },
};
