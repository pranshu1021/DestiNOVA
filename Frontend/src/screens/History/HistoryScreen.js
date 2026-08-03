import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";
import api from "../../services/api";

const renderSafeText = (val, fallback = "") => {
  if (!val) return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") return val.title || val.name || fallback;
  return fallback;
};

export default function HistoryScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/history");
      if (res.data.success) {
        setHistoryItems(res.data.data || []);
      }
    } catch (err) {
      console.log("History load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredItems = activeFilter === "All"
    ? historyItems
    : historyItems.filter((item) => item.type === activeFilter);

  const getIconName = (type) => {
    switch (type) {
      case "Kundli": return "document-text-outline";
      case "Matching": return "heart-outline";
      case "Panchang": return "calendar-outline";
      case "Numerology": return "calculator-outline";
      case "AI Chat": return "sparkles-outline";
      default: return "time-outline";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateStr);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={getIconName(item.type)} size={22} color={colors.primary} />
      </View>
      <View style={styles.textWrapper}>
        <View style={styles.titleRow}>
          <Text style={[styles.itemType, { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold }]}>
            {renderSafeText(item.type)}
          </Text>
          <Text style={[styles.itemDate, { color: colors.textSub, fontSize: typography.sizes.caption }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <Text style={[styles.itemTitle, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
          {renderSafeText(item.title)}
        </Text>
        <Text style={[styles.itemSub, { color: colors.textSub, fontSize: typography.sizes.small }]}>
          {renderSafeText(item.subtitle)}
        </Text>
      </View>
    </View>
  );

  const filters = ["All", "Kundli", "Matching", "Panchang", "Numerology", "AI Chat"];

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
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>
              Cosmic History
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>
              Your past queries & celestial readings
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterScrollWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: spacing.xxl, gap: 8, paddingVertical: 8 }}
            renderItem={({ item }) => {
              const active = activeFilter === item;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                  onPress={() => setActiveFilter(item)}
                >
                  <Text style={[styles.filterText, { color: active ? colors.white : colors.textMain, fontSize: 13, fontWeight: "600" }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSub, marginTop: 12 }]}>Loading cosmic history...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingHorizontal: spacing.xxl, paddingBottom: 110 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                  No History Yet
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSub, fontSize: typography.sizes.body, textAlign: "center" }]}>
                  Your generated Kundlis, matches, and Panchang queries will appear here!
                </Text>
              </View>
            }
          />
        )}

        <CosmicBottomBar currentRoute="History" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: {},
  subtitle: {},
  filterScrollWrapper: { marginBottom: 6 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  filterText: {},
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {},
  listContent: { gap: 12, paddingTop: 6 },
  card: { flexDirection: "row", alignItems: "center", padding: 16, borderWidth: 1, gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  textWrapper: { flex: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  itemType: { textTransform: "uppercase", letterSpacing: 0.5 },
  itemDate: {},
  itemTitle: { marginBottom: 2 },
  itemSub: {},
  emptyContainer: { flex: 1, minHeight: 300, justifyContent: "center", alignItems: "center", gap: 10 },
  emptyTitle: {},
  emptySub: { maxWidth: 280, lineHeight: 20 },
});
