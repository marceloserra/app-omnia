import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { X, FileText } from 'lucide-react-native';
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
        <Image source={{ uri: attachment.uri }} style={styles.imagePreview} />
      ) : (
        <View style={styles.iconContainer}>
          <FileText size={18} color={theme.textPrimary} />
        </View>
      )}
      
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="middle">
          {attachment.name}
        </Text>
      </View>

      <Pressable 
        onPress={onRemove}
        style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}
        hitSlop={12}
      >
        <X size={14} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingLeft: 6,
    paddingRight: 8,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 160,
  },
  imagePreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  name: {
    fontSize: 13,
    color: theme.textPrimary,
    fontWeight: '500',
  },
  removeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.activeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
