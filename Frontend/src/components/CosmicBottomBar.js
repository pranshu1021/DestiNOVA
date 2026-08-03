import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

export default function CosmicBottomBar({ currentRoute }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, typography, borderRadius, shadows } = useContext(ThemeContext);

  const activeRouteName = currentRoute || route?.name || "Home";

  const tabs = [
    { name: "Home", label: "Home", icon: "sparkles", outlineIcon: "sparkles-outline" },
    { name: "Horoscope", label: "Horoscope", icon: "planet", outlineIcon: "planet-outline" },
    { name: "AIChat", label: "AI Guide", icon: "chatbubbles", outlineIcon: "chatbubbles-outline" },
    { name: "History", label: "History", icon: "time", outlineIcon: "time-outline" },
    { name: "Profile", label: "Profile", icon: "person", outlineIcon: "person-outline" },
  ];

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View
        style={[
          styles.barWrapper,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderGlow || colors.border,
            borderRadius: borderRadius.xl || 26,
            ...shadows.primaryGlow,
          },
        ]}
      >
        {tabs.map((tab) => {
          const isFocused = activeRouteName === tab.name;

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.7}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && {
                  backgroundColor: colors.primaryLight || "rgba(147, 51, 234, 0.2)",
                  borderRadius: borderRadius.lg || 18,
                },
              ]}
            >
              <Ionicons
                name={isFocused ? tab.icon : tab.outlineIcon}
                size={20}
                color={isFocused ? colors.primary : colors.textSub}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    fontSize: 10,
                    fontWeight: isFocused ? typography.weights.bold : typography.weights.medium,
                    color: isFocused ? colors.primary : colors.textMuted,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 22,
    left: 18,
    right: 18,
    alignItems: "center",
    zIndex: 99,
  },
  barWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: "100%",
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    gap: 3,
  },
  tabLabel: {
    textAlign: "center",
  },
});
