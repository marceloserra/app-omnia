import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../lib/theme";

/**
 * A classic staggered bounce "typing" indicator.
 * Hardware-accelerated (useNativeDriver: true) to run smoothly at 60 FPS
 * regardless of JS thread congestion during streaming.
 */
export function TypingIndicator() {
  const theme = useTheme();
  const [anim1] = useState(new Animated.Value(0));
  const [anim2] = useState(new Animated.Value(0));
  const [anim3] = useState(new Animated.Value(0));

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -6,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(300), // Wait before bouncing again
          ])
        )
      ]);
    };

    const animation = Animated.parallel([
      createBounce(anim1, 0),
      createBounce(anim2, 150),
      createBounce(anim3, 300),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [anim1, anim2, anim3]);

  const isDark = theme.bg === "#05050f";
  const dotColor = isDark ? "#818cf8" : theme.textSecondary;

  return (
    <View style={typingStyles.row}>
      <Animated.View style={[typingStyles.dot, { backgroundColor: dotColor, transform: [{ translateY: anim1 }] }]} />
      <Animated.View style={[typingStyles.dot, { backgroundColor: dotColor, transform: [{ translateY: anim2 }] }]} />
      <Animated.View style={[typingStyles.dot, { backgroundColor: dotColor, transform: [{ translateY: anim3 }] }]} />
    </View>
  );
}

const typingStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
});
