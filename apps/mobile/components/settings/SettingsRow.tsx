import React from 'react';
import { View, Text } from 'react-native';
import { Divider } from '../ui';

/**
 * SettingsRow component for individual setting configuration.
 * 
 * @example
 * <SettingsRow label="Temperature" value={0.7} onValueChange={setTemp} />
 */
interface SettingsRowProps {
  /** Setting label/name */
  label: string;
  /** Current value display */
  value?: string | number;
  /** Value change handler */
  onValueChange?: (value: any) => void;
  /** Description/help text */
  description?: string;
  /** Whether this setting is disabled */
  disabled?: boolean;
}

export function SettingsRow({ 
  label, 
  value, 
  onValueChange,
  description,
  disabled = false 
}: SettingsRowProps) {
  return (
    <View className="flex flex-col py-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className={`text-base font-medium ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </Text>
        
        {value !== undefined && (
          <Text className="text-sm text-muted-foreground">{value}</Text>
        )}
      </View>
      
      {description && (
        <Text className="text-sm text-muted-foreground mb-2">
          {description}
        </Text>
      )}
      
      {/* Value input/control would go here based on setting type */}
      {/* This is a placeholder - actual implementation varies by setting type */}
    </View>
  );
}

export default SettingsRow;
