import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import api from "../../services/api";

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to load today's Muhurat timings. Please try again.";

export default function MuhuratScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [muhurat, setMuhurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadMuhurat = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError(null);
      const response = await api.get("/muhurat");
      setMuhurat(response.data.data);
    } catch (requestError) {
      setMuhurat(null);
      setError({ message: getErrorMessage(requestError), statusCode: requestError.response?.status });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMuhurat();
  }, [loadMuhurat]);

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

  const auspicious = muhurat?.auspicious_period || [];
  const inauspicious = muhurat?.inauspicious_period || [];

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
          <TouchableOpacity accessibilityLabel="Go back" style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Shubh Muhurat</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>Auspicious & inauspicious daily timings</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadMuhurat(true)} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.textSub, fontSize: typography.sizes.body }]}>Calculating solar transitions...</Text>
            </View>
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
              <Ionicons name="cloud-offline-outline" size={34} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>Unable to load Muhurats</Text>
              <Text style={[styles.emptyText, { color: colors.textSub, fontSize: typography.sizes.body }]}>{error.message}</Text>
              <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]} onPress={() => loadMuhurat()}>
                <Text style={{ color: colors.white, fontWeight: typography.weights.bold }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.muhuratContainer}>
              
              {/* Auspicious Timings Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.success, borderWidth: 1.5, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                <Text style={[styles.cardTitle, { color: colors.success, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: spacing.md }]}>
                  ✅ Shubh Muhurats (Auspicious)
                </Text>
                {auspicious.length > 0 ? (
                  auspicious.map((item, idx) => (
                    <View key={idx} style={[styles.periodRow, idx < auspicious.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                      <Text style={[styles.periodName, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                        {item.name}
                      </Text>
                      {item.period && item.period.map((time, pIdx) => (
                        <Text key={pIdx} style={[styles.periodTime, { color: colors.textSub }]}>
                          ⏰ {formatTime(time.start)} - {formatTime(time.end)}
                        </Text>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.textSub }}>No auspicious timings today</Text>
                )}
              </View>

              {/* Inauspicious Timings Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.danger, borderWidth: 1.5, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                <Text style={[styles.cardTitle, { color: colors.danger, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: spacing.md }]}>
                  ❌ Ashubh Timings (Inauspicious)
                </Text>
                {inauspicious.length > 0 ? (
                  inauspicious.map((item, idx) => (
                    <View key={idx} style={[styles.periodRow, idx < inauspicious.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                      <Text style={[styles.periodName, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                        {item.name} Kaal
                      </Text>
                      {item.period && item.period.map((time, pIdx) => (
                        <Text key={pIdx} style={[styles.periodTime, { color: colors.textSub }]}>
                          ⏰ {formatTime(time.start)} - {formatTime(time.end)}
                        </Text>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.textSub }}>No inauspicious timings today</Text>
                )}
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
  muhuratContainer: { gap: 20, marginTop: 10 },
  card: { padding: 20 },
  cardTitle: {},
  periodRow: { paddingVertical: 12 },
  periodName: { marginBottom: 4 },
  periodTime: { fontSize: 14, fontWeight: "500" }
});
