import React from 'react';
import { View, Modal, TouchableOpacity, Text } from 'react-native';

/**
 * Sheet component for bottom sheet overlays (settings, model selection).
 * 
 * @example
 * <Sheet open={isOpen} onDismiss={() => setIsOpen(false)}>
 *   <ModelSelector />
 * </Sheet>
 */
interface SheetProps {
  /** Whether sheet is visible */
  open: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Sheet height - auto calculates based on content or fixed */
  height?: 'auto' | 'half' | 'full';
  /** Title displayed in sheet header */
  title?: string;
}

export function Sheet({ 
  open, 
  onDismiss, 
  children, 
  height = 'auto',
  title 
}: SheetProps) {
  const heightClasses = {
    auto: 'h-auto',
    half: 'h-1/2',
    full: 'h-full',
  };

  if (!open && !onDismiss) return null;

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <TouchableOpacity 
          className="absolute inset-0 bg-black/50"
          onPress={onDismiss}
          accessibilityLabel="Dismiss sheet"
        />
        
        {/* Sheet Content */}
        <View className={`bg-background rounded-t-xl border-t border-border ${heightClasses[height]} max-h-[80vh]`}>
          {title && (
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Text className="text-lg font-semibold text-foreground">{title}</Text>
              <TouchableOpacity 
                onPress={onDismiss}
                accessibilityLabel="Close sheet"
              >
                <Text className="text-base text-muted-foreground">✕</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View className="flex-1 overflow-auto p-4">
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default Sheet;
