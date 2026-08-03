import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import api from "../../services/api";

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to load today's Panchang. Please try again.";

const renderSafeText = (val, fallback = "N/A") => {
  if (!val) return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") return val.name || val.vedic_name || val.description || val.type || fallback;
  return fallback;
};

export default function PanchangScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [panchang, setPanchang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPanchang = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError(null);
      const response = await api.get("/panchang");
      setPanchang(response.data.data);
    } catch (requestError) {
      setPanchang(null);
      setError({ message: getErrorMessage(requestError), statusCode: requestError.response?.status });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPanchang();
  }, [loadPanchang]);

  // Format datetime into readable format
  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const panchangDetails = panchang?.panchang || panchang;

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
          <TouchableOpacity accessibilityLabel="Go back" style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Daily Panchang</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>Planetary timings & planetary transitions</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPanchang(true)} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.textSub, fontSize: typography.sizes.body }]}>Fetching daily planetary alignment...</Text>
            </View>
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
              <Ionicons name="cloud-offline-outline" size={34} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>Unable to load Panchang</Text>
              <Text style={[styles.emptyText, { color: colors.textSub, fontSize: typography.sizes.body }]}>{error.message}</Text>
              <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]} onPress={() => loadPanchang()}>
                <Text style={{ color: colors.white, fontWeight: typography.weights.bold }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.panchangContainer}>
              
              {/* Sun & Moon Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                <Text style={[styles.cardTitle, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: spacing.md }]}>
                  ☀️ Sun & Moon Timings
                </Text>
                <View style={styles.grid}>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>🌅 Sunrise</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{formatTime(panchangDetails?.sunrise || panchang?.sunrise)}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>🌇 Sunset</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{formatTime(panchangDetails?.sunset || panchang?.sunset)}</Text>
                    </View>
                  </View>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>🌙 Moonrise</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{formatTime(panchangDetails?.moonrise || panchang?.moonrise)}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>🌑 Moonset</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{formatTime(panchangDetails?.moonset || panchang?.moonset)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Tithi Details Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                <Text style={[styles.cardTitle, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: spacing.md }]}>
                  📜 Tithi details
                </Text>
                {panchangDetails?.tithi ? (
                  panchangDetails.tithi.map((item, idx) => {
                    const lordName = renderSafeText(item.lord || item.deity || item.diety, "");
                    return (
                      <View key={idx} style={[styles.kootaRow, idx < panchangDetails.tithi.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                        <Text style={[styles.kutaName, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                          {renderSafeText(item.name)}
                        </Text>
                        <Text style={[styles.kutaDesc, { color: colors.textSub }]}>
                          {lordName ? `Lord: ${lordName} | ` : ""}Paksha: {renderSafeText(item.paksha)}
                        </Text>
                        <Text style={[styles.kutaDesc, { color: colors.textSub, marginTop: 2 }]}>
                          Starts: {formatTime(item.start)} | Ends: {formatTime(item.end)}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={{ color: colors.textSub }}>No Tithi details available</Text>
                )}
              </View>

              {/* Nakshatra Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                <Text style={[styles.cardTitle, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: spacing.md }]}>
                  🌌 Nakshatra details
                </Text>
                {panchangDetails?.nakshatra ? (
                  panchangDetails.nakshatra.map((item, idx) => {
                    const lordName = renderSafeText(item.lord || item.deity || item.diety, "");
                    return (
                      <View key={idx} style={[styles.kootaRow, idx < panchangDetails.nakshatra.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                        <Text style={[styles.kutaName, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                          {renderSafeText(item.name)}
                        </Text>
                        {lordName ? (
                          <Text style={[styles.kutaDesc, { color: colors.textSub }]}>
                            Lord: {lordName}
                          </Text>
                        ) : null}
                        <Text style={[styles.kutaDesc, { color: colors.textSub, marginTop: 2 }]}>
                          Starts: {formatTime(item.start)} | Ends: {formatTime(item.end)}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={{ color: colors.textSub }}>No Nakshatra details available</Text>
                )}
              </View>

              {/* Yoga & Karana Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                <Text style={[styles.cardTitle, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: spacing.md }]}>
                  🌀 Yoga & Karana
                </Text>
                <View style={styles.grid}>
                  <View style={styles.gridCol}>
                    <Text style={[styles.label, { color: colors.textSub }]}>Yoga</Text>
                    {panchangDetails?.yoga ? (
                      panchangDetails.yoga.map((item, idx) => (
                        <Text key={idx} style={[styles.value, { color: colors.textMain, marginBottom: 4 }]}>
                          {renderSafeText(item.name)} (Ends: {formatTime(item.end)})
                        </Text>
                      ))
                    ) : (
                      <Text style={[styles.value, { color: colors.textMain }]}>N/A</Text>
                    )}
                  </View>
                  <View style={[styles.gridCol, { marginTop: spacing.md }]}>
                    <Text style={[styles.label, { color: colors.textSub }]}>Karana</Text>
                    {panchangDetails?.karana ? (
                      panchangDetails.karana.map((item, idx) => (
                        <Text key={idx} style={[styles.value, { color: colors.textMain, marginBottom: 4 }]}>
                          {renderSafeText(item.name)} (Ends: {formatTime(item.end)})
                        </Text>
                      ))
                    ) : (
                      <Text style={[styles.value, { color: colors.textMain }]}>N/A</Text>
                    )}
                  </View>
                </View>
              </View>

            </View>
          )}
        </ScrollView>
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
  content: { flexGrow: 1 },
  stateContainer: { flex: 1, minHeight: 300, alignItems: "center", justifyContent: "center", gap: 12 },
  stateText: {},
  emptyCard: { alignItems: "center", borderWidth: 1, padding: 28, marginVertical: 40 },
  emptyTitle: { textAlign: "center", marginTop: 14 },
  emptyText: { textAlign: "center", lineHeight: 20, marginTop: 8 },
  retryButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 11 },
  panchangContainer: { gap: 20, marginTop: 10 },
  card: { borderWidth: 1, padding: 20 },
  cardTitle: {},
  grid: { gap: 12 },
  gridRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  gridCol: { flex: 1 },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: "600" },
  kootaRow: { paddingVertical: 10 },
  kutaName: { marginBottom: 4 },
  kutaDesc: { fontSize: 13, lineHeight: 18 }
});
