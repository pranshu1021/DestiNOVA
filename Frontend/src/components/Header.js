import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

export default function Header({ user, onLeftPress, onRightPress }) {
  const { colors, spacing, typography, borderRadius } = useContext(ThemeContext);

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingHorizontal: spacing.xxl }]}>
  
      <TouchableOpacity activeOpacity={0.7} onPress={onLeftPress} style={styles.leftAction}>
        {user?.photo ? (
          <Image source={{ uri: user.photo }} style={[styles.avatar, { borderColor: colors.primary }]} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Ionicons name="person" size={16} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>

    
      <View style={styles.titleContainer}>
        <Text style={[styles.titleText, { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.primary }]}>
          DestiNOVA
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={onRightPress} style={styles.rightAction}>
        <Ionicons name="notifications-outline" size={24} color={colors.textMain} />
        <View style={[styles.badgeDot, { backgroundColor: colors.danger }]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    borderBottomWidth: 1,
  },
  leftAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  titleText: {
    letterSpacing: 0.5,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: 36,
    height: 36,
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
