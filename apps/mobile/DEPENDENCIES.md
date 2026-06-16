# Required Dependencies Installation

Run these commands to install missing dependencies:

```bash
cd apps/mobile

# Testing dependencies
npm install --save-dev @types/jest jest-expo @testing-library/react-native

# UI component utilities
npm install class-variance-authority tailwind-variants

# Icons
npm install lucide-react-native react-native-vector-icons

# Storybook (optional)
npm install --save-dev @storybook/react-native @storybook/addon-ondevice-controls @storybook/addon-ondevice-actions
```

## Notes

- Jest types are required for test files in `__tests__/` directory
- class-variance-authority is used by Button component for variant styling
- lucide-react-native provides icon components for IconButton
- Storybook dependencies needed for component documentation

After installation, run:
```bash
npm install
npx tsc --noEmit  # Verify no errors
npm test         # Run tests
```
