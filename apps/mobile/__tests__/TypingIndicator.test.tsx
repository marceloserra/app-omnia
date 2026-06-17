import React from 'react';
import { render } from '@testing-library/react-native';
import { TypingIndicator } from '../components/ui/TypingIndicator';

jest.mock('../lib/theme', () => ({
  useTheme: () => ({ bg: '#05050f', surface: '#0d0c1d', textPrimary: '#f8fafc', textSecondary: '#94a3b8', indigo: '#6366f1', red: '#ef4444', activeBg: '#1e1e2e', border: '#ffffff' })
}));

describe('TypingIndicator Component', () => {
  it('renders successfully', () => {
    const { root } = render(<TypingIndicator />);
    expect(root).toBeTruthy();
  });
});