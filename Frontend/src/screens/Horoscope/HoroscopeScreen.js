import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import HoroscopeCard from "../../components/HoroscopeCard";
import CosmicBottomBar from "../../components/CosmicBottomBar";
import api from "../../services/api";

const TABS = [
  { key: "today", label: "Today" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to load your horoscope. Please try again.";

export default function HoroscopeScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("today");
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadHoroscope = useCallback(async (period, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError(null);
      const response = await api.get(`/horoscope/${period}`);
      setHoroscope(response.data.data);
    } catch (requestError) {
      setHoroscope(null);
      setError({ message: getErrorMessage(requestError), statusCode: requestError.response?.status });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHoroscope(activeTab);
  }, [activeTab, loadHoroscope]);

  const activeLabel = TABS.find((tab) => tab.key === activeTab)?.label || "Horoscope";
  const isUnavailable = error?.statusCode === 501;

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
          <TouchableOpacity accessibilityLabel="Go back" style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Celestial Horoscope</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>Your cosmic alignment & transits</Text>
          </View>
        </View>

        <View style={[styles.tabs, { marginHorizontal: spacing.xxl, backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: isActive }} style={[styles.tab, isActive && { backgroundColor: colors.primary, borderRadius: borderRadius.md }]} onPress={() => setActiveTab(tab.key)}>
                <Text style={{ color: isActive ? colors.white : colors.textSub, fontSize: typography.sizes.small, fontWeight: typography.weights.semiBold }}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xxl, paddingBottom: spacing.xxl + 80 }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHoroscope(activeTab, true)} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.textMain, fontSize: typography.sizes.h3, fontWeight: typography.weights.bold }]}>{activeLabel} Reading</Text>
          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.textSub, fontSize: typography.sizes.body, marginTop: 12 }]}>Reading planetary alignments...</Text>
            </View>
          ) : horoscope ? (
            <HoroscopeCard {...horoscope} />
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
              <Ionicons name={isUnavailable ? "calendar-outline" : "cloud-offline-outline"} size={34} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>{isUnavailable ? `${activeLabel} guidance is unavailable` : "Unable to load horoscope"}</Text>
              <Text style={[styles.emptyText, { color: colors.textSub, fontSize: typography.sizes.body }]}>{error?.message}</Text>
              {!isUnavailable && <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]} onPress={() => loadHoroscope(activeTab)}><Text style={{ color: colors.white, fontWeight: typography.weights.bold }}>Try Again</Text></TouchableOpacity>}
            </View>
          )}
        </ScrollView>

        <CosmicBottomBar currentRoute="Horoscope" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: {},
  subtitle: { marginTop: 2 },
  tabs: { flexDirection: "row", borderWidth: 1, padding: 4 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 9 },
  content: { flexGrow: 1 },
  sectionTitle: { marginBottom: 14 },
  stateContainer: { flex: 1, minHeight: 280, alignItems: "center", justifyContent: "center" },
  stateText: {},
  emptyCard: { alignItems: "center", borderWidth: 1, padding: 28 },
  emptyTitle: { textAlign: "center", marginTop: 14 },
  emptyText: { textAlign: "center", lineHeight: 20, marginTop: 8 },
  retryButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 11 },
});
