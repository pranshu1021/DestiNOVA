import React, { useContext, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import api from "../../services/api";

export default function SubscriptionScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const [selectedPlan, setSelectedPlan] = useState("yearly"); // 'monthly' | 'yearly'
  const [purchasing, setPurchasing] = useState(false);

  const isAlreadyPremium = user?.isPremium;

  const handleSubscribe = async () => {
    try {
      setPurchasing(true);
      // Premium activation endpoint
      const expires = new Date();
      if (selectedPlan === "yearly") {
        expires.setFullYear(expires.getFullYear() + 1);
      } else {
        expires.setMonth(expires.getMonth() + 1);
      }

      const res = await api.put("/auth/update-profile", {
        isPremium: true,
        premiumExpiresAt: expires,
      });

      if (res.data.success && res.data.user) {
        await updateUser(res.data.user);
        Alert.alert(
          "🌟 DestiNOVA Premium Unlocked!",
          `Congratulations! You have unlocked all premium cosmic insights under the ${selectedPlan.toUpperCase()} plan.`
        );
        navigation.goBack();
      }
    } catch (err) {
      console.log("Subscription purchase error:", err);
      Alert.alert("Subscription Error", "Unable to complete purchase. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const premiumFeatures = [
    { icon: "sparkles", text: "Unlimited AI Astrologer Consultations" },
    { icon: "heart", text: "Deep Ashta Kuta Compatibility Matching" },
    { icon: "calendar", text: "Advanced Auspicious Shubh Muhurats" },
    { icon: "calculator", text: "Full Life Path Numerology Grid Analysis" },
    { icon: "star", text: "Ad-free Cosmic Experience & Fast Response" },
  ];

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={22} color={colors.textMain} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl }]} showsVerticalScrollIndicator={false}>
          {/* Badge & Title */}
          <View style={styles.heroSection}>
            <View style={[styles.proBadge, { backgroundColor: colors.primary, borderRadius: borderRadius.xl }]}>
              <Ionicons name="sparkles" size={18} color={colors.white} />
              <Text style={[styles.proBadgeText, { color: colors.white, fontWeight: typography.weights.bold, fontSize: 13 }]}>
                DESTINOVA PRO
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.textMain, fontSize: typography.sizes.h1, fontWeight: typography.weights.bold }]}>
              Unlock Your Cosmic Potential
            </Text>
            <Text style={[styles.heroSub, { color: colors.textSub, fontSize: typography.sizes.body }]}>
              Unlimited predictions, detailed Kundlis & personal AI astrology guide.
            </Text>
          </View>

          {/* Features List */}
          <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
            {premiumFeatures.map((feat, idx) => (
              <View key={idx} style={[styles.featureRow, idx < premiumFeatures.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                <View style={[styles.featIconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name={feat.icon} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.featText, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.medium }]}>
                  {feat.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Plan Selector */}
          <View style={styles.plansContainer}>
            {/* Yearly Plan */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedPlan === "yearly" ? colors.primary : colors.border,
                  borderWidth: selectedPlan === "yearly" ? 2 : 1,
                  borderRadius: borderRadius.xl,
                  ...shadows.soft,
                },
              ]}
              onPress={() => setSelectedPlan("yearly")}
            >
              <View style={[styles.saveTag, { backgroundColor: colors.success }]}>
                <Text style={styles.saveTagText}>SAVE 40%</Text>
              </View>
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                    Yearly Access
                  </Text>
                  <Text style={[styles.planSub, { color: colors.textSub, fontSize: typography.sizes.small }]}>$39.99 / year ($3.33/mo)</Text>
                </View>
                <View style={[styles.radioCircle, { borderColor: selectedPlan === "yearly" ? colors.primary : colors.textSub }]}>
                  {selectedPlan === "yearly" && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedPlan === "monthly" ? colors.primary : colors.border,
                  borderWidth: selectedPlan === "monthly" ? 2 : 1,
                  borderRadius: borderRadius.xl,
                  ...shadows.soft,
                },
              ]}
              onPress={() => setSelectedPlan("monthly")}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                    Monthly Access
                  </Text>
                  <Text style={[styles.planSub, { color: colors.textSub, fontSize: typography.sizes.small }]}>$4.99 / month</Text>
                </View>
                <View style={[styles.radioCircle, { borderColor: selectedPlan === "monthly" ? colors.primary : colors.textSub }]}>
                  {selectedPlan === "monthly" && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.subscribeBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.lg, ...shadows.primaryGlow }]}
            onPress={handleSubscribe}
            disabled={purchasing}
          >
            <Text style={[styles.subscribeBtnText, { color: colors.white, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
              {isAlreadyPremium ? "Extend Premium Subscription" : `Start PRO (${selectedPlan.toUpperCase()})`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "flex-end" },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  content: { gap: 20 },
  heroSection: { alignItems: "center", textAlign: "center" },
  proBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, gap: 6, marginBottom: 12 },
  proBadgeText: { letterSpacing: 1 },
  heroTitle: { textAlign: "center", marginBottom: 6 },
  heroSub: { textAlign: "center", lineHeight: 20, maxWidth: 300 },
  featuresCard: { borderWidth: 1, padding: 16 },
  featureRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  featIconCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  featText: { flex: 1 },
  plansContainer: { gap: 12 },
  planCard: { borderWidth: 1, padding: 18, position: "relative" },
  saveTag: { position: "absolute", top: -10, right: 16, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  saveTagText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planTitle: {},
  planSub: { marginTop: 2 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  subscribeBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 10 },
  subscribeBtnText: {},
});
