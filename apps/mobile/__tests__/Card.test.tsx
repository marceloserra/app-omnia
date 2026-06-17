import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card, CardContent } from '../components/ui/Card';

jest.mock('../lib/theme', () => ({
  useTheme: () => ({ bg: '#05050f', surface: '#0d0c1d', textPrimary: '#f8fafc', textSecondary: '#94a3b8', indigo: '#6366f1', red: '#ef4444', activeBg: '#1e1e2e', border: '#ffffff' })
}));

describe('Card Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card><CardContent><Text>Test Card</Text></CardContent></Card>
    );
    expect(getByText('Test Card')).toBeTruthy();
  });
});