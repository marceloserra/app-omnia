import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmDialog } from '../ConfirmDialog';

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
  AlertTriangle: 'AlertTriangle'
}));

// Mock theme
jest.mock('../../../lib/theme', () => ({
  useTheme: () => ({
    surface2: '#ffffff',
    textPrimary: '#000000',
    textSecondary: '#666666',
    border: '#dddddd',
    activeBg: '#f5f5f5'
  })
}));

describe('ConfirmDialog', () => {
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <ConfirmDialog
        visible={true}
        title="Delete Chat?"
        message="This action cannot be undone."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(getByText('Delete Chat?')).toBeTruthy();
    expect(getByText('This action cannot be undone.')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const onConfirmMock = jest.fn();
    const { getByText } = render(
      <ConfirmDialog
        visible={true}
        title="Delete Chat?"
        message="This action cannot be undone."
        onConfirm={onConfirmMock}
        onCancel={jest.fn()}
      />
    );

    fireEvent.press(getByText('Delete'));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancelMock = jest.fn();
    const { getByText } = render(
      <ConfirmDialog
        visible={true}
        title="Delete Chat?"
        message="This action cannot be undone."
        onConfirm={jest.fn()}
        onCancel={onCancelMock}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
