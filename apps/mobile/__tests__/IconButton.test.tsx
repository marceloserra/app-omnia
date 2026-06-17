import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { IconButton } from '../components/ui/IconButton';

describe('IconButton Component', () => {
  it('renders icon and handles press', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon={<Text testID="icon">X</Text>} onPress={onPress} />
    );
    fireEvent.press(getByTestId('icon'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});