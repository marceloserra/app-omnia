import React from 'react';
import { TextInput, View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme';

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
  const theme = useTheme();

  return (
    <View style={[{ flexDirection: 'column' }, containerStyle]}>
      {label && (
        <Text style={{ marginBottom: 6, fontSize: 13, fontWeight: '500', color: theme.textSecondary }}>
          {label}
        </Text>
      )}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        {...props}
        editable={!disabled}
        accessibilityLabel={label || placeholder}
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? theme.red : theme.border,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: theme.textPrimary,
          backgroundColor: theme.surface2,
          minHeight: isTextarea ? 100 : undefined,
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {error && errorMessage && (
        <Text style={{ marginTop: 6, fontSize: 12, color: theme.red }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

export default Input;
