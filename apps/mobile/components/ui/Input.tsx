import React from 'react';
import { TextInput, View, Text, ViewStyle } from 'react-native';

interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  variant?: 'text' | 'textarea' | 'search';
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  className?: string;
}

export function Input({
  label,
  variant = 'text',
  error = false,
  errorMessage,
  disabled = false,
  containerStyle,
  placeholder,
  ...props
}: InputProps) {
  const isTextarea = variant === 'textarea';

  return (
    <View style={[{ flexDirection: 'column' }, containerStyle]}>
      {label && (
        <Text style={{ marginBottom: 6, fontSize: 13, fontWeight: '500', color: '#c7d2fe' }}>
          {label}
        </Text>
      )}

      <TextInput
        placeholder={placeholder}
        {...props}
        editable={!disabled}
        accessibilityLabel={label || placeholder}
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : 'rgba(99, 102, 241, 0.4)',
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: '#f0f0ff',
          backgroundColor: 'rgba(30, 27, 75, 0.8)',
          minHeight: isTextarea ? 100 : undefined,
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {error && errorMessage && (
        <Text style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

export default Input;
