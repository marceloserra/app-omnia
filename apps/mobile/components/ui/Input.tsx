import React from 'react';
import { TextInput, View, Text, TextStyle, ViewStyle } from 'react-native';

/**
 * Input component for text entry with label support.
 * 
 * @example
 * <Input label="Message" placeholder="Type..." variant="textarea" />
 */
interface InputProps {
  /** Label displayed above input */
  label?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Current value */
  value?: string;
  /** Change handler */
  onChangeText?: (text: string) => void;
  /** Input variant - affects height and multiline support */
  variant?: 'text' | 'textarea' | 'search';
  /** Error state with message display */
  error?: boolean;
  errorMessage?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Additional text input styles */
  style?: TextStyle;
  /** Container styles */
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'text',
  error = false,
  errorMessage,
  disabled = false,
  autoFocus = false,
  style,
  containerStyle,
}: InputProps) {
  const isTextarea = variant === 'textarea';

  return (
    <View className={`flex flex-col ${containerStyle?.toString()}`}>
      {label && (
        <Text className="mb-1 text-sm font-medium text-foreground">
          {label}
        </Text>
      )}
      
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={isTextarea}
        numberOfLines={isTextarea ? 6 : 1}
        editable={!disabled}
        autoFocus={autoFocus}
        accessibilityLabel={label || placeholder}
        className={`
          rounded-md border px-3 py-2 text-base 
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'bg-muted opacity-50' : 'bg-background'}
          ${isTextarea ? 'min-h-[100px]' : ''}
          ${variant === 'search' ? 'pl-8' : ''}
        `}
        style={style}
      />
      
      {error && errorMessage && (
        <Text className="mt-1 text-sm text-destructive">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

export default Input;
