import React, { useContext, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ThemeContext } from "../context/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CosmicBackground({ children }) {
  const { isDark, colors } = useContext(ThemeContext);

  const pulseAnim = useSharedValue(1);
  const floatAnim = useSharedValue(0);

useEffect(() => {
  pulseAnim.value = withRepeat(
    withTiming(1.15, {
      duration: 4000,
    }),
    -1,
    true
  );

  floatAnim.value = withRepeat(
    withTiming(20, {
      duration: 6000,
    }),
    -1,
    true
  );
}, []);

  const animatedNebula1 = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnim.value },
      { translateY: floatAnim.value },
    ],
  }));

  const animatedNebula2 = useAnimatedStyle(() => ({
    transform: [
      { scale: 2.15 - pulseAnim.value },
      { translateY: -floatAnim.value },
    ],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Left Violet Aurora Orb */}
      <Animated.View
        style={[
          styles.nebula,
          animatedNebula1,
          {
            top: -SCREEN_WIDTH * 0.25,
            left: -SCREEN_WIDTH * 0.25,
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
            borderRadius: SCREEN_WIDTH * 0.45,
            backgroundColor: isDark
  ? "rgba(138, 30, 42, 0.22)"   // Royal Burgundy
  : "rgba(183, 138, 73, 0.10)", // Soft Gold
          },
        ]}
      />

      <Animated.View
  style={[
    styles.nebula,
    {
      bottom: -SCREEN_WIDTH * 0.2,
      left: SCREEN_WIDTH * 0.15,
      width: SCREEN_WIDTH * 0.7,
      height: SCREEN_WIDTH * 0.7,
      borderRadius: SCREEN_WIDTH * 0.35,
      backgroundColor: isDark
        ? "rgba(120, 18, 30, 0.14)"
        : "rgba(183, 138, 73, 0.06)",
    },
  ]}
/>
      {/* Bottom Right Cyan Cosmic Orb */}
      <Animated.View
        style={[
          styles.nebula,
          animatedNebula2,
          {
            top: SCREEN_HEIGHT * 0.4,
            right: -SCREEN_WIDTH * 0.3,
            width: SCREEN_WIDTH * 1.0,
            height: SCREEN_WIDTH * 1.0,
            borderRadius: SCREEN_WIDTH * 0.5,
            backgroundColor: isDark
  ? "rgba(201, 168, 106, 0.12)"  // Antique Gold Glow
  : "rgba(183, 138, 73, 0.08)",
          },
        ]}
      />

      {/* Center Ambient Glow */}
      <View
        style={[
          styles.nebula,
          {
            top: SCREEN_HEIGHT * 0.2,
            left: SCREEN_WIDTH * 0.1,
            width: SCREEN_WIDTH * 0.8,
            height: SCREEN_WIDTH * 0.8,
            borderRadius: SCREEN_WIDTH * 0.4,
           backgroundColor: isDark
  ? "rgba(231, 216, 178, 0.05)"  // Champagne Glow
  : "rgba(201, 168, 106, 0.04)",
          },
        ]}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nebula: {
    position: "absolute",
    pointerEvents: "none",
  },
});
