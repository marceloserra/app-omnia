import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../components/ui/Input';

// Mock useTheme to prevent errors in tests since it relies on Context/Zustand
jest.mock('../lib/theme', () => ({
  useTheme: () => ({
    bg: '#05050f',
    surface: '#0d0c1d',
    surface2: '#13122a',
    border: '#ffffff',
    indigo: '#6366f1',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#475569',
    red: '#ef4444',
    activeBg: '#1e1e2e',
    purple: '#a855f7',
  })
}));

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text..." />);
    expect(getByPlaceholderText('Enter text...')).toBeTruthy();
  });

  it('renders label when provided', () => {
    const { getByText } = render(<Input label="Username" placeholder="Enter username" />);
    expect(getByText('Username')).toBeTruthy();
  });

  it('handles text changes correctly', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Type here" onChangeText={onChangeTextMock} />
    );
    
    fireEvent.changeText(getByPlaceholderText('Type here'), 'Omnia');
    expect(onChangeTextMock).toHaveBeenCalledWith('Omnia');
  });

  it('shows error message when error is true', () => {
    const { getByText } = render(
      <Input error={true} errorMessage="Invalid input" placeholder="Test" />
    );
    expect(getByText('Invalid input')).toBeTruthy();
  });

  it('disables input when disabled prop is true', () => {
    const { getByPlaceholderText } = render(<Input disabled={true} placeholder="Disabled" />);
    const input = getByPlaceholderText('Disabled');
    expect(input.props.editable).toBe(false);
  });
});
