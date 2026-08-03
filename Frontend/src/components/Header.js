import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

export default function Header({ user, onLeftPress, onRightPress }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.xxl,
          ...shadows.soft,
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={onLeftPress} style={styles.leftAction}>
        {user?.photo ? (
          <Image source={{ uri: user.photo }} style={[styles.avatar, { borderColor: colors.primary }]} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Ionicons name="menu" size={20} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <View style={styles.logoRow}>
          <Ionicons name="sparkles" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.titleText, { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textMain }]}>
            DestiNOVA
          </Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={onRightPress} style={styles.rightAction}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="notifications-outline" size={18} color={colors.primary} />
          <View style={[styles.badgeDot, { backgroundColor: colors.accent }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    borderBottomWidth: 1,
  },
  leftAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    letterSpacing: 1,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
