import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import api from "../../services/api";

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to calculate your Numerology. Please try again.";

export default function NumerologyScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [numerology, setNumerology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadNumerology = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError(null);
      const response = await api.get("/numerology");
      setNumerology(response.data.data);
    } catch (requestError) {
      setNumerology(null);
      setError({ message: getErrorMessage(requestError), statusCode: requestError.response?.status });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNumerology();
  }, [loadNumerology]);

  const numDetails = numerology?.life_path_number;

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
          <TouchableOpacity accessibilityLabel="Go back" style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Numerology</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>Your Life Path number & cosmic profile</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNumerology(true)} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.textSub, fontSize: typography.sizes.body }]}>Calculating birth grid numbers...</Text>
            </View>
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
              <Ionicons name="cloud-offline-outline" size={34} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>Unable to calculate Numerology</Text>
              <Text style={[styles.emptyText, { color: colors.textSub, fontSize: typography.sizes.body }]}>{error.message}</Text>
              <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]} onPress={() => loadNumerology()}>
                <Text style={{ color: colors.white, fontWeight: typography.weights.bold }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.numerologyContainer}>
              
              {/* Life Path Number Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft, alignItems: "center" }]}>
                <Text style={[styles.numberLabel, { color: colors.textSub, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                  YOUR LIFE PATH NUMBER
                </Text>
                <View style={[styles.numberCircle, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Text style={[styles.numberValue, { color: colors.primary, fontSize: 44, fontWeight: "900" }]}>
                    {numDetails?.number || "1"}
                  </Text>
                </View>
                <Text style={[styles.numberName, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginVertical: spacing.sm }]}>
                  {numDetails?.name || "The Leader"}
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textMain, fontSize: typography.sizes.body, textAlign: "justify", lineHeight: 22 }]}>
                  {numDetails?.description || "Your life path number holds the key to your personality, destiny, and spiritual potential."}
                </Text>
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
  numerologyContainer: { gap: 20, marginTop: 10 },
  card: { borderWidth: 1, padding: 24 },
  numberLabel: { letterSpacing: 1 },
  numberCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, justifyContent: "center", alignItems: "center", marginVertical: 16 },
  numberValue: {},
  numberName: {},
  descriptionText: {}
});
