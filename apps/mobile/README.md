# Omnia Mobile App

React Native mobile application for AI conversations using Expo Router and NativeWind.

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with drawer navigation
│   ├── index.tsx          # Chat screen (main conversation)
│   └── settings.tsx       # Settings and provider configuration
├── components/            # Reusable UI components
│   ├── ui/                # Base UI primitives
│   │   ├── Button.tsx     # Button with variants and sizes
│   │   ├── IconButton.tsx # Icon button component
│   │   ├── Input.tsx      # Text input with validation
│   │   ├── Avatar.tsx     # User avatar display
│   │   ├── Divider.tsx    # Visual separator
│   │   ├── Card.tsx       # Content container
│   │   └── Sheet.tsx      # Bottom sheet modal
│   ├── chat/              # Chat-specific components
│   │   ├── ChatBubble.tsx     # Message bubble component
│   │   ├── ChatComposer.tsx   # Message input composer
│   │   └── ConversationItem.tsx # Conversation list item
│   ├── model/             # Model selection UI
│   │   └── ModelSelector.tsx  # Provider/model picker
│   ├── navigation/        # Navigation components
│   │   └── DrawerContent.tsx  # Drawer menu content
│   ├── providers/         # Provider-specific UI
│   │   └── ProviderCard.tsx   # Provider display card
│   └── settings/          # Settings components
│       └── SettingsRow.tsx    # Settings option row
├── __tests__/             # Unit tests
│   ├── Button.test.tsx
│   └── ChatBubble.test.tsx
├── assets/                # Static assets
│   └── css/global.css     # Global styles
├── types/                 # TypeScript type definitions
│   └── css.d.ts           # CSS module types
└── .storybook/            # Storybook configuration
```

## Tech Stack

- **Framework**: Expo SDK 54 with React Native
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library
- **Documentation**: Storybook

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npx expo start
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. View component stories:
   ```bash
   npm run storybook
   ```

## Features

- ✅ Drawer navigation with conversation list
- ✅ Chat interface with message bubbles
- ✅ Model/provider selection
- ✅ Settings configuration
- ✅ Responsive design with NativeWind
- ✅ TypeScript type safety
- ✅ Unit tests for core components
- ✅ Storybook documentation

## Architecture Notes

- Components use NativeWind classes for styling
- Barrel exports (`index.ts`) provide clean imports
- TypeScript strict mode enabled
- Jest configured for React Native testing
