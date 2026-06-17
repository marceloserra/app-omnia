import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

jest.mock('../lib/theme', () => ({
  useTheme: () => ({ bg: '#05050f', surface: '#0d0c1d', textPrimary: '#f8fafc', textSecondary: '#94a3b8', indigo: '#6366f1', red: '#ef4444', activeBg: '#1e1e2e', border: '#ffffff' })
}));

describe('ConfirmDialog Component', () => {
  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <ConfirmDialog visible={false} title="Delete?" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(queryByText('Delete?')).toBeNull();
  });

  it('renders title and message when visible', () => {
    const { getByText } = render(
      <ConfirmDialog visible={true} title="Delete?" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(getByText('Delete?')).toBeTruthy();
    expect(getByText('Sure?')).toBeTruthy();
  });

  it('calls onCancel when cancel is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <ConfirmDialog visible={true} title="Delete?" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});