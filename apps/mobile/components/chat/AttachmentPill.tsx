import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { X, FileText } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTheme, ThemePalette } from '../../lib/theme';

export interface Attachment {
  uri: string;
  name: string;
  type: 'image' | 'document';
  mimeType?: string;
  size?: number;
}

interface Props {
  attachment: Attachment;
  onRemove: () => void;
}

export function AttachmentPill({ attachment, onRemove }: Props) {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const isImage = attachment.type === 'image';

  return (
    <View style={styles.container}>
      {isImage ? (
        <Image 
          source={{ uri: attachment.uri }} 
          style={styles.imagePreview} 
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.documentPreview}>
          <FileText size={28} color={theme.indigo} />
          <Text style={styles.documentName} numberOfLines={1} ellipsizeMode="middle">
            {attachment.name}
          </Text>
        </View>
      )}

      <Pressable 
        onPress={onRemove}
        style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
        hitSlop={8}
      >
        <X size={12} color="#ffffff" strokeWidth={3} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  container: {
    marginRight: 12,
    marginTop: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  documentPreview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: theme.surface2,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  documentName: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.surface2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
