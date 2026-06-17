import React from "react";
import { View, Text, StyleSheet, Modal, Pressable, Animated } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useTheme, ThemePalette } from "../../lib/theme";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [show, setShow] = React.useState(visible);
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => setShow(false));
    }
  }, [visible]);

  if (!show) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        
        <Animated.View style={[styles.dialog, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={24} color="#ef4444" />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                onCancel();
              }}
              style={({ pressed }) => [styles.btnCancel, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.btnCancelText}>{cancelText}</Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                onConfirm();
              }}
              style={({ pressed }) => [styles.btnConfirm, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill as any,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: theme.surface2,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.activeBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  btnCancelText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnConfirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
