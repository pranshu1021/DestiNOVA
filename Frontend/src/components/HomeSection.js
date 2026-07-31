import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export default function HomeSection({ title, children, actionText, onActionPress }) {
  const { colors, spacing, typography } = useContext(ThemeContext);

  return (
    <View style={[styles.sectionContainer, { marginVertical: spacing.lg, paddingHorizontal: spacing.xxl }]}>
      <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
        <Text style={[styles.titleText, { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textMain }]}>
          {title}
        </Text>
        {actionText && onActionPress && (
            <TouchableOpacity activeOpacity={0.7} onPress={onActionPress}>
            <Text style={[styles.actionText, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.primary }]}>
                 {actionText}
            </Text>
            </TouchableOpacity>
        )}
        </View>
        <View style={styles.contentContainer}>
          {children}
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    letterSpacing: 0.25,
  },
  actionText: {},
  contentContainer: {
    width: "100%",
  },
});
