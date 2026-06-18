import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Camera, Image as ImageIcon, FileText } from 'lucide-react-native';
import { useTheme, ThemePalette } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: 'camera' | 'library' | 'files') => void;
}

export function AttachmentMenu({ visible, onClose, onSelect }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const isDark = theme.bg === '#05050f';

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.menuContainer, { marginBottom: insets.bottom + 90 }]}>
          <BlurView intensity={isDark ? 60 : 100} tint={isDark ? "dark" : "light"} style={styles.menuInner}>
            <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => onSelect('camera')}>
              <View style={[styles.iconBox, { backgroundColor: theme.indigo + '20' }]}>
                <Camera size={20} color={theme.indigo} />
              </View>
              <Text style={styles.menuText}>{t('chat.input.attach.camera') || 'Camera'}</Text>
            </Pressable>
            
            <View style={styles.divider} />

            <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => onSelect('library')}>
              <View style={[styles.iconBox, { backgroundColor: '#10b981' + '20' }]}>
                <ImageIcon size={20} color="#10b981" />
              </View>
              <Text style={styles.menuText}>{t('chat.input.attach.library') || 'Photo Library'}</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => onSelect('files')}>
              <View style={[styles.iconBox, { backgroundColor: '#f59e0b' + '20' }]}>
                <FileText size={20} color="#f59e0b" />
              </View>
              <Text style={styles.menuText}>{t('chat.input.attach.files') || 'Files'}</Text>
            </Pressable>
          </BlurView>
        </View>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menuContainer: {
    marginLeft: 16,
    width: 240,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  menuInner: {
    paddingVertical: 8,
    backgroundColor: theme.bg === '#05050f' ? 'rgba(20,20,30,0.7)' : 'rgba(255,255,255,0.7)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: theme.activeBg,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 68,
  },
});
