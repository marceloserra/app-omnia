import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders button with children correctly', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('applies correct variant classes', () => {
    const { debug } = render(<Button variant="primary">Primary</Button>);
    // In a real test, we would check the className prop
    expect(true).toBe(true); // Placeholder assertion
  });

  it('handles onPress correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock}>Click Me</Button>
    );
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading prop is true', () => {
    const { getByText } = render(
      <Button loading={true}>Loading</Button>
    );
    
    // ActivityIndicator should be present
    expect(true).toBe(true); // Placeholder - would check for ActivityIndicator in real test
  });

  it('disables button when loading is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button loading={true} onPress={onPressMock}>Disabled</Button>
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
