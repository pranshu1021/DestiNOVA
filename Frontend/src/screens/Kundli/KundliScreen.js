import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";
import api from "../../services/api";

const renderSafeText = (val, fallback = "") => {
  if (!val) return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") return val.name || val.description || val.type || "";
  return fallback;
};

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to generate your birth chart right now.";

export default function KundliScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [kundli, setKundli] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadKundli = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError(null);
      const response = await api.get("/kundli");
      setKundli(response.data.data);
    } catch (requestError) {
      setKundli(null);
      setError({ message: getErrorMessage(requestError), statusCode: requestError.response?.status });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadKundli();
  }, [loadKundli]);

  const nakshatra = kundli?.nakshatra_details?.nakshatra;
  const chandraRasi = kundli?.nakshatra_details?.chandra_rasi;
  const sooryaRasi = kundli?.nakshatra_details?.soorya_rasi;
  const zodiac = kundli?.nakshatra_details?.zodiac;
  const addInfo = kundli?.nakshatra_details?.additional_info;
  const mangal = kundli?.mangal_dosha;
  const yogas = kundli?.yoga_details || [];

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
          <TouchableOpacity accessibilityLabel="Go back" style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>My Kundli</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>Vedic birth chart & planetary details</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xxl, paddingBottom: 110 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadKundli(true)} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.textSub, fontSize: typography.sizes.body, marginTop: 12 }]}>Calculating birth chart alignments...</Text>
            </View>
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
              <Ionicons name="cloud-offline-outline" size={34} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>Unable to load Kundli</Text>
              <Text style={[styles.emptyText, { color: colors.textSub, fontSize: typography.sizes.body }]}>{error.message}</Text>
              <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]} onPress={() => loadKundli()}>
                <Text style={{ color: colors.white, fontWeight: typography.weights.bold }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.kundliContainer}>
              {/* Birth Details Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                <Text style={[styles.cardTitle, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                  ✨ Vedic Birth Details
                </Text>

                <View style={styles.grid}>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Nakshatra</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{nakshatra?.name} (Pada {nakshatra?.pada})</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Lord</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{nakshatra?.lord?.name} ({nakshatra?.lord?.vedic_name})</Text>
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Chandra Rasi</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{chandraRasi?.name} ({chandraRasi?.lord?.vedic_name})</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Soorya Rasi</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{sooryaRasi?.name} ({sooryaRasi?.lord?.vedic_name})</Text>
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Zodiac Sign</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{zodiac?.name}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Deity</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{addInfo?.deity}</Text>
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Ganam</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{addInfo?.ganam}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={[styles.label, { color: colors.textSub }]}>Nadi</Text>
                      <Text style={[styles.value, { color: colors.textMain }]}>{addInfo?.nadi}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Mangal Dosha Card */}
              {mangal && (
                <View style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: mangal.has_dosha ? colors.danger : colors.success,
                    borderWidth: 1.5,
                    borderRadius: borderRadius.xl,
                    ...shadows.soft
                  }
                ]}>
                  <View style={styles.mangalHeader}>
                    <Ionicons
                      name={mangal.has_dosha ? "warning-outline" : "checkmark-circle-outline"}
                      size={24}
                      color={mangal.has_dosha ? colors.danger : colors.success}
                    />
                    <Text style={[
                      styles.cardTitle,
                      {
                        color: mangal.has_dosha ? colors.danger : colors.success,
                        fontSize: typography.sizes.large,
                        fontWeight: typography.weights.bold,
                        marginLeft: 8
                      }
                    ]}>
                      Mangal Dosha Analysis
                    </Text>
                  </View>
                  <Text style={[styles.mangalDesc, { color: colors.textMain, fontSize: typography.sizes.body, marginTop: spacing.md }]}>
                    {renderSafeText(mangal.description, "Mangal Dosha details evaluated.")}
                  </Text>
                </View>
              )}

              {/* Yogas Card */}
              {yogas.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
                  <Text style={[styles.cardTitle, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: spacing.md }]}>
                    🪐 Major Kundli Yogas
                  </Text>

                  {yogas.map((yoga, idx) => (
                    <View key={idx} style={[styles.yogaItem, idx < yogas.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                      <Text style={[styles.yogaName, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                        {yoga.name}
                      </Text>
                      <Text style={[styles.yogaDesc, { color: colors.textSub, fontSize: typography.sizes.small }]}>
                        {yoga.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <CosmicBottomBar currentRoute="Kundli" />
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
  stateContainer: { flex: 1, minHeight: 300, alignItems: "center", justifyContent: "center" },
  stateText: {},
  emptyCard: { alignItems: "center", borderWidth: 1, padding: 28, marginVertical: 40 },
  emptyTitle: { textAlign: "center", marginTop: 14 },
  emptyText: { textAlign: "center", lineHeight: 20, marginTop: 8 },
  retryButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 11 },
  kundliContainer: { gap: 20, marginTop: 10 },
  card: { borderWidth: 1, padding: 20 },
  cardTitle: {},
  grid: { marginTop: 15, gap: 12 },
  gridRow: { flexDirection: "row", justifyContent: "space-between" },
  gridCol: { flex: 1, paddingRight: 10 },
  label: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 14, fontWeight: "600" },
  mangalHeader: { flexDirection: "row", alignItems: "center" },
  mangalDesc: { lineHeight: 22 },
  yogaItem: { paddingVertical: 12 },
  yogaName: { marginBottom: 4 },
  yogaDesc: { lineHeight: 18 }
});
