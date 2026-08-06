import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import Header from "../../components/Header";
import AstroDrawer from "../../components/AstroDrawer";
import HomeSection from "../../components/HomeSection";
import AstrologerCard from "../../components/AstrologerCard";
import HoroscopeCard from "../../components/HoroscopeCard";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";
import api from "../../services/api";
import { ActivityIndicator } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout, refreshUserProfile } = useContext(AuthContext);
  const { colors, isDark, shadows, typography, borderRadius, spacing } = useContext(ThemeContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dailyHoroscope, setDailyHoroscope] = useState(null);
  const [horoscopeError, setHoroscopeError] = useState("");
  const [astrologers, setAstrologers] = useState([]);
  const [isLoadingAstrologers, setIsLoadingAstrologers] = useState(true);

  useEffect(() => {
    const backAction = () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isDrawerOpen]);

  const loadAstrologers = useCallback(async () => {
    try {
      setIsLoadingAstrologers(true);
      const response = await api.get("/astrologer/list");
      setAstrologers(response.data.data || []);
    } catch (error) {
      console.log("Astrologer list error:", error);
      setAstrologers([]);
    } finally {
      setIsLoadingAstrologers(false);
    }
  }, []);

  useEffect(() => {
    if (user?.astrologer?.isApproved) {
      navigation.replace("AstrologerDashboard");
    }
  }, [user, navigation]);

  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
      loadAstrologers();
    }, [refreshUserProfile, loadAstrologers])
  );

  useEffect(() => {
    let isMounted = true;
    const loadDailyHoroscope = async () => {
      try {
        setHoroscopeError("");
        const response = await api.get("/horoscope/today");
        if (isMounted) {
          setDailyHoroscope(response.data.data);
        }
      } catch (error) {
        if (isMounted) {
          setHoroscopeError(error.response?.data?.message || "Cosmic energy aligning...");
        }
      }
    };
    loadDailyHoroscope();
    return () => {
      isMounted = false;
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const categories = [
    { name: "Horoscope", route: "Horoscope", icon: "planet-outline", color: colors.primary },
    { name: "Kundli", route: "Kundli", icon: "document-text-outline", color: colors.secondary },
    { name: "Matching", route: "KundliMatching", icon: "heart-outline", color: colors.danger },
    { name: "Panchang", route: "Panchang", icon: "calendar-outline", color: colors.success },
    { name: "Muhurat", route: "Muhurat", icon: "time-outline", color: colors.warning },
    { name: "Numerology", route: "Numerology", icon: "calculator-outline", color: colors.primary },
  ];

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
        <Header
          user={user}
          onLeftPress={() => setIsDrawerOpen(true)}
          onRightPress={() => navigation.navigate("NotificationSettings")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xxl + 80 }]}
        >
          {/* Welcome Banner */}
          <View style={[styles.welcomeBanner, { paddingHorizontal: spacing.xxl, paddingTop: spacing.md }]}>
            <View style={styles.greetingBadge}>
              <Ionicons name="sparkles" size={14} color={colors.accent} />
              <Text style={[styles.greetingText, { fontSize: typography.sizes.small, color: colors.textSub, fontWeight: "600" }]}>
                {getGreeting().toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.userNameText, { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textMain }]}>
              {user?.fullName || "Astro Seeker"}
            </Text>
          </View>

          {/* Category Grid */}
          <HomeSection title="Cosmic Services">
            <View style={styles.categoryGrid}>
              {categories.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: borderRadius.xl || 20,
                      ...shadows.soft,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate(cat.route)}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name={cat.icon} size={22} color={cat.color} />
                  </View>
                  <Text numberOfLines={1} style={[styles.categoryText, { fontSize: 12, fontWeight: typography.weights.bold, color: colors.textMain }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </HomeSection>

          {/* Today's Horoscope */}
          <HomeSection title="Today's Celestial Horoscope">
            {dailyHoroscope ? (
              <HoroscopeCard {...dailyHoroscope} />
            ) : (
              <View style={[styles.horoscopeStatusCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl }]}>
                <Ionicons name="planet" size={28} color={colors.primary} />
                <Text style={[styles.horoscopeStatus, { color: horoscopeError ? colors.danger : colors.textSub, marginTop: 8 }]}>
                  {horoscopeError || "Gathering daily planetary transits..."}
                </Text>
              </View>
            )}
          </HomeSection>

          {/* Premium Banner */}
          <View style={[styles.premiumBanner, { backgroundColor: colors.primary, marginHorizontal: spacing.xxl, marginVertical: spacing.lg, padding: spacing.xl, borderRadius: borderRadius.xl, ...shadows.primaryGlow }]}>
            <View style={{ marginBottom: spacing.md }}>
              <View style={styles.proTag}>
                <Ionicons name="star" size={12} color={colors.white} />
                <Text style={styles.proTagText}>PRO ACCESS</Text>
              </View>
              <Text style={[styles.premiumTitle, { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.white }]}>
                Unlock DestiNOVA Pro
              </Text>
              <Text style={[styles.premiumSubtitle, { fontSize: typography.sizes.body, color: "rgba(255, 255, 255, 0.85)" }]}>
                Unlimited AI Astro Consultations & Advanced Kundli Matching
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.premiumButton, { backgroundColor: colors.white, borderRadius: borderRadius.lg }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Subscription")}
            >
              <Text style={[styles.premiumButtonText, { color: colors.primary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                Upgrade Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Top Astrologers */}
          <HomeSection title="Top Vedic Astrologers" actionText="See All" onActionPress={() => navigation.navigate("AstrologerList") }>
            {isLoadingAstrologers ? (
              <View style={[styles.loadingRow, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}> 
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : astrologers.length === 0 ? (
              <View style={[styles.emptyRow, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}> 
                <Text style={[styles.emptyText, { color: colors.textSub }]}>No approved astrologers are available right now.</Text>
              </View>
            ) : (
              astrologers.slice(0, 4).map((astro) => (
                <AstrologerCard
                  key={astro._id}
                  name={astro.fullName || astro.name}
                  specialty={astro.expertise ? astro.expertise.join(", ") : astro.about || "Vedic Astrology"}
                  experience={astro.experienceYears || astro.experience || 0}
                  rating={astro.rating || 0}
                  price={astro.chatPricePerMinute || astro.price || 0}
                  image={astro.profilePhoto || astro.image}
                  isOnline={astro.isOnline}
                  onPress={() => navigation.navigate("AstrologerDetail", { astrologerId: astro._id })}
                />
              ))
            )}
          </HomeSection>
        </ScrollView>

        <CosmicBottomBar currentRoute="Home" />

        <AstroDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          user={user}
          onViewProfile={() => navigation.navigate("Profile")}
          onPremium={() => navigation.navigate("Subscription")}
          onHoroscope={() => navigation.navigate("Horoscope")}
          onKundli={() => navigation.navigate("KundliMatching")}
          onAIChat={() => navigation.navigate("AIChat")}
          onNotifications={() => navigation.navigate("NotificationSettings")}
          onAdmin={() => navigation.navigate("AdminPanel")}
          onAstroSignup={() => navigation.navigate(user?.astrologer?.isApproved ? "AstrologerDashboard" : "AstroSignup")}
          onWallet={() => navigation.navigate("Wallet")}
          onHelp={() => Alert.alert("DestiNOVA Support", "Contact support@destinova.app for assistance.")}
          onLogout={logout}
        />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  scrollContent: {},
  welcomeBanner: { paddingBottom: 10 },
  greetingBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  greetingText: { letterSpacing: 1 },
  userNameText: { marginTop: 2 },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  categoryCard: {
    width: "30%",
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  categoryIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: { textAlign: "center" },
  loadingRow: { alignItems: "center", justifyContent: "center" },
  emptyRow: { alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
  horoscopeStatusCard: { padding: 24, alignItems: "center", marginHorizontal: 20, borderWidth: 1 },
  horoscopeStatus: { textAlign: "center" },
  premiumBanner: {},
  proTag: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  proTagText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
  premiumTitle: {},
  premiumSubtitle: { lineHeight: 20, marginTop: 4 },
  premiumButton: { paddingVertical: 14, justifyContent: "center", alignItems: "center" },
  premiumButtonText: {},
});
