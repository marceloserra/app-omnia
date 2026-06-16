import type { WebpackOverlayConfig } from '@storybook/types';

const config: WebpackOverlayConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  docs: '../docs/**/*.md',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
