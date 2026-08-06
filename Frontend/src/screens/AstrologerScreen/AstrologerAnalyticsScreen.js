import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../services/api";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";

export default function AstrologerAnalyticsScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/astrologer/dashboard");
      const data = response.data.data || {};
      setAnalytics({
        todaysEarnings: data.earnings || 0,
        monthlyEarnings: data.astrologer?.totalEarnings || 0,
        lifetimeEarnings: data.astrologer?.totalEarnings || 0,
        balance: data.balance || 0,
        rating: data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
      });
    } catch (error) {
      console.log("Astrologer analytics load error:", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading || !analytics) {
    return (
      <CosmicBackground>
        <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSub, marginTop: spacing.sm }]}>Loading analytics...</Text>
          </View>
        </SafeAreaView>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.md }]}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextWrapper}>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Analytics</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>Review your recent performance data.</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.statsRow, { marginBottom: spacing.lg }]}> 
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Today's Earnings</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>₹{analytics.todaysEarnings}</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Monthly Earnings</Text>
              <Text style={[styles.metricValue, { color: colors.success }]}>₹{analytics.monthlyEarnings}</Text>
            </View>
          </View>

          <View style={[styles.statsRow, { marginBottom: spacing.lg }]}> 
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Lifetime Earnings</Text>
              <Text style={[styles.metricValue, { color: colors.warning }]}>₹{analytics.lifetimeEarnings}</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Wallet Balance</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>{analytics.balance ? `₹${analytics.balance}` : "₹0"}</Text>
            </View>
          </View>

          <View style={[styles.statsRow, { marginBottom: spacing.lg }]}> 
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Rating</Text>
              <Text style={[styles.metricValue, { color: colors.warning }]}>{analytics.rating.toFixed(1)}</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Reviews</Text>
              <Text style={[styles.metricValue, { color: colors.textMain }]}>{analytics.reviewsCount}</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
            <Text style={[styles.summaryTitle, { color: colors.textMain }]}>Insights</Text>
            <Text style={[styles.summaryText, { color: colors.textSub }]}>Your analytics are based on recent session earnings and customer reviews. Keep your profile updated to increase visibility and bookings.</Text>
          </View>
        </View>

        <CosmicBottomBar currentRoute="AstrologerAnalytics" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1 },
  headerTextWrapper: { flex: 1 },
  title: { marginBottom: 4 },
  subtitle: {},
  content: { flex: 1, padding: 20 },
  statusText: { textAlign: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  metricBox: { flex: 1, padding: 18, borderWidth: 1 },
  metricLabel: { marginBottom: 8 },
  metricValue: { fontSize: 22, fontWeight: "700" },
  summaryCard: { padding: 20, borderWidth: 1 },
  summaryTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  summaryText: { fontSize: 14, lineHeight: 22 },
});
