import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../services/api";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";

export default function AstrologerSessionsScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/wallet/balance");
      const data = response.data.data || {};
      setTransactions(data.transactions || []);
    } catch (error) {
      console.log("Astrologer sessions load error:", error);
      Alert.alert("Unable to load sessions", error.response?.data?.message || "Please try again later.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const renderSession = ({ item }) => {
    const isCredit = item.type === "CREDIT";
    const category = item.category?.replace(/_/g, " ") || "Session";
    const sessionType = category.toLowerCase().includes("call") ? "Call" : category.toLowerCase().includes("chat") ? "Chat" : "Session";
    return (
      <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
        <View>
          <Text style={[styles.sessionTitle, { color: colors.textMain }]}>{sessionType}</Text>
          <Text style={[styles.sessionSubtitle, { color: colors.textSub }]}>{item.description || category}</Text>
        </View>
        <View style={styles.sessionMeta}>
          <Text style={[styles.sessionAmount, { color: isCredit ? colors.success : colors.danger }]}>{isCredit ? "+" : "-"}₹{item.amount}</Text>
          <Text style={[styles.sessionTime, { color: colors.textSub }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <CosmicBackground>
        <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSub, marginTop: spacing.sm }]}>Loading your session history...</Text>
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
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Sessions</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>Recent calls and chat earnings.</Text>
          </View>
        </View>

        <View style={styles.content}>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>No recent sessions yet</Text>
              <Text style={[styles.emptyMessage, { color: colors.textSub }]}>Your session activity will appear here after your first consultation.</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item._id || String(item.createdAt) + item.amount}
              renderItem={renderSession}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <CosmicBottomBar currentRoute="AstrologerSessions" />
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
  sessionCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 18, marginBottom: 14, borderWidth: 1 },
  sessionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  sessionSubtitle: { fontSize: 13, lineHeight: 20 },
  sessionMeta: { alignItems: "flex-end" },
  sessionAmount: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  sessionTime: { fontSize: 12 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: "700" },
  emptyMessage: { marginTop: 8, fontSize: 14, textAlign: "center" },
  listContent: { paddingBottom: 120 },
});
