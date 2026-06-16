// Jest setup file for React Native testing
import '@testing-library/react-native';

// Mock NativeWind/CSS-in-JS if needed
jest.mock('nativewind', () => ({
  create: jest.fn(),
}));

// Mock any other dependencies as needed
