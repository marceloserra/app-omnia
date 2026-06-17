import React from 'react';
import { render } from '@testing-library/react-native';
import { Divider } from '../components/ui/Divider';

jest.mock('../lib/theme', () => ({
  useTheme: () => ({ bg: '#05050f', surface: '#0d0c1d', textPrimary: '#f8fafc', textSecondary: '#94a3b8', indigo: '#6366f1', red: '#ef4444', activeBg: '#1e1e2e', border: '#ffffff' })
}));

describe('Divider Component', () => {
  it('renders successfully', () => {
    const { root } = render(<Divider />);
    expect(root).toBeTruthy();
  });
});