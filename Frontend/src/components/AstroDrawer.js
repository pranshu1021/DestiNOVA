import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

export default function AstroDrawer({
    isOpen,
    onClose,
    user,
    onViewProfile,
    onPremium,
    onHoroscope,
    onKundli,
    onAIChat,
    onNotifications,
    onWallet,
    onHelp,
    onLogout,
    onAstroSignup,
    onAdmin,
}) {
  const { colors, typography, borderRadius, themeMode, setThemeMode, shadows } = useContext(ThemeContext);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const slideAnim = useSharedValue(-DRAWER_WIDTH);
  const opacityAnim = useSharedValue(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetShouldRender = (val) => {
    if (isMounted.current) {
      setShouldRender(val);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      slideAnim.value = withTiming(0, { duration: 250 });
      opacityAnim.value = withTiming(0.45, { duration: 250 });
    } else {
      opacityAnim.value = withTiming(0, { duration: 220 });
      slideAnim.value = withTiming(-DRAWER_WIDTH, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(safeSetShouldRender)(false);
        }
      });
    }
  }, [isOpen]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  if (!shouldRender) return null;

    const menuItems = [
        {label: "My Profile", icon: "person-outline", onPress: onViewProfile},
        {label: "DestiNOVA PRO", icon: "star-outline", onPress: onPremium, badge: "PRO", badgeColor: colors.accent},
        {label: "Daily Horoscope", icon: "planet-outline", onPress: onHoroscope},
        {label: "Kundli Matching", icon: "heart-outline", onPress: onKundli},
        {label: "Astro AI Guide", icon: "chatbubbles-outline", onPress: onAIChat, badge: "AI", badgeColor: colors.primary},
        {label: "Wallet", icon: "wallet-outline", onPress: onWallet},
        ...(user?.isAdmin ? [{label: "Admin Panel", icon: "shield-checkmark-outline", onPress: onAdmin, badge: "ADMIN", badgeColor: colors.danger}] : []),
        {label: "Notification Settings", icon: "notifications-outline", onPress: onNotifications},
        {label: "Help & Support", icon: "help-circle-outline", onPress: onHelp},
        {
          label: user?.astrologer?.isApproved ? "My Astro Dashboard" : "Become An Astrologer",
          icon: "sparkles-outline",
          onPress: onAstroSignup,
        },
    ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {isOpen && (
        <TouchableOpacity
          activeOpacity={0.5}
          style={[styles.overlay, { opacity: 0.5 }]}
          onPress={onClose}
        />
      )}


      <Animated.View
        style={[
          styles.drawerContainer,
          {
            backgroundColor: colors.cardSolid,
            borderColor: colors.border,
            paddingTop: Platform.OS === "ios" ? 50 : 30,
            ...shadows.luxuryGlow,
          },
          animatedDrawerStyle,
        ]}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={[styles.avatar, { borderColor: colors.primary }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <Ionicons name="sparkles" size={28} color={colors.primary} />
            </View>
          )}

          <Text numberOfLines={1} style={[styles.userName, { fontSize: typography.sizes.large, fontWeight: typography.weights.bold, color: colors.textMain }]}>
            {user?.fullName || "Astro Explorer"}
          </Text>
          <Text numberOfLines={1} style={[styles.userEmail, { fontSize: typography.sizes.small, color: colors.textSub }]}>
            {user?.email || "seeker@destinova.app"}
          </Text>
        </View>

        {/* Menu Items */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                if (item.onPress) item.onPress();
              }}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: colors.textMain }]}>
                {item.label}
              </Text>
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: item.badgeColor || colors.primary }]}>
                  <Text style={[styles.badgeText, { fontWeight: typography.weights.bold, color: colors.white }]}>
                    {item.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Theme & Logout */}
        <View style={[styles.bottomContainer, { borderTopColor: colors.border }]}>
          <View style={styles.themeSelectorSection}>
            <Text style={[styles.themeTitle, { fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, color: colors.textSub }]}>
              THEME MODE
            </Text>

            <View style={[styles.themeRow, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
              {["light", "dark", "system"].map((mode) => {
                const isActive = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    activeOpacity={0.8}
                    style={[
                      styles.themeBtn,
                      { borderRadius: borderRadius.sm },
                      isActive && { backgroundColor: colors.cardSolid, ...shadows.soft },
                    ]}
                    onPress={() => setThemeMode(mode)}
                  >
                    <Text
                      style={[
                        styles.themeBtnText,
                        { fontSize: typography.sizes.caption, fontWeight: isActive ? "700" : "500", color: isActive ? colors.primary : colors.textSub },
                      ]}
                    >
                      {mode.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              if (onLogout) onLogout();
            }}
          >
            <View style={[styles.iconWrapper, { backgroundColor: colors.dangerBg }]}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            </View>
            <Text style={[styles.logoutLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: colors.danger }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    zIndex: 9998,
  },
  drawerContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    justifyContent: "space-between",
    borderRightWidth: 1,
    zIndex: 9999,
    elevation: 24,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 12,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
  },
  userName: { marginBottom: 2 },
  userEmail: {},
  menuContainer: { flex: 1, paddingVertical: 12 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: { flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10 },
  bottomContainer: { borderTopWidth: 1, paddingVertical: 16 },
  themeSelectorSection: { paddingHorizontal: 20, marginBottom: 14 },
  themeTitle: { marginBottom: 8, letterSpacing: 0.5 },
  themeRow: { flexDirection: "row", padding: 3, justifyContent: "space-between" },
  themeBtn: { flex: 1, paddingVertical: 8, justifyContent: "center", alignItems: "center" },
  themeBtnText: { textAlign: "center" },
  logoutButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 20 },
  logoutLabel: {},
});
