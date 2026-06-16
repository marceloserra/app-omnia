import type { Preview } from '@storybook/react';
import { View, Text, StyleSheet } from 'react-native';

// Global decorators for all stories
export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: ['Primitives', 'Chat', 'Providers', 'Settings', 'Model'],
    },
  },
};

// Theme wrapper component for stories
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'var(--color-background)',
  },
});

export const decorators = [
  (storyContext: any) => {
    return <ThemeWrapper>{storyContext()}</ThemeWrapper>;
  },
];

const preview: Preview = {
  parameters: {
    backgrounds: {
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;
