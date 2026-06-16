import type { Meta, StoryObj } from '@storybook/react';
import { SettingsRow } from './SettingsRow';

const meta: Meta<typeof SettingsRow> = {
  title: 'Composed/SettingsRow',
  component: SettingsRow,
};

export default meta;

type Story = StoryObj<typeof SettingsRow>;

export const Default: Story = {
  args: {
    label: 'Temperature',
    value: 0.7,
    description: 'Controls randomness (0 = deterministic, 1 = creative)',
  },
};

export const TextValue: Story = {
  args: {
    label: 'Theme',
    value: 'System',
    description: 'Follow system dark/light mode preference',
  },
};
