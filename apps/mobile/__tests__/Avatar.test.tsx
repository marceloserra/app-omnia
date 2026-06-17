import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '../components/ui/Avatar';

describe('Avatar Component', () => {
  it('renders correctly with fallback', () => {
    const { getByText } = render(<Avatar fallback="OM" />);
    expect(getByText('OM')).toBeTruthy();
  });
});