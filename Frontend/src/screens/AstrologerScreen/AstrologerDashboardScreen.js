import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { initSocket, getSocket } from "../../services/socket";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";

export default function AstrologerDashboardScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const { logout, user } = useContext(AuthContext);
  const currentUserId = user?.id || user?._id || user?.userId || "";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/astrologer/dashboard");
      setDashboard(response.data.data || null);
    } catch (error) {
      console.log("Astrologer dashboard error:", error);
      Alert.alert("Unable to load dashboard", error.response?.data?.message || "Please try again later.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const registerSocket = async () => {
      try {
        const socket = await initSocket();
        socket.on("incoming_chat_request", ({ sessionId, customerId, pricePerMinute, customerName, astrologerName }) => {
          setPendingRequest({ sessionId, customerId, pricePerMinute, customerName, astrologerName });
          Alert.alert("New chat request", `${customerName || "A customer"} wants to start a chat.`);
        });
      } catch (error) {
        console.log("Dashboard socket init error:", error);
      }
    };
    registerSocket();
  }, [loadDashboard]);

  const toggleOnlineStatus = async () => {
    if (!dashboard?.astrologer) return;
    try {
      setUpdatingStatus(true);
      await api.put("/astrologer/status", { isOnline: !dashboard.astrologer.isOnline });
      await loadDashboard();
    } catch (error) {
      console.log("Toggle online status error:", error);
      Alert.alert("Status update failed", error.response?.data?.message || "Could not update online status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const acceptPendingRequest = () => {
    if (!pendingRequest?.sessionId || !currentUserId) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("accept_chat_request", {
      sessionId: pendingRequest.sessionId,
      customerId: pendingRequest.customerId,
      astrologerId: currentUserId,
    });
    setPendingRequest(null);
    navigation.navigate("AstrologerSession", {
      sessionId: pendingRequest.sessionId,
      astrologerId: pendingRequest.astrologerId,
      astrologerName: pendingRequest.astrologerName || "Astrologer",
      astrologerUserId: pendingRequest.customerId,
      sessionType: "chat",
      costPerMinute: pendingRequest.pricePerMinute || 15,
    });
  };

  const rejectPendingRequest = () => {
    if (!pendingRequest?.sessionId) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("reject_chat_request", {
      sessionId: pendingRequest.sessionId,
      customerId: pendingRequest.customerId,
    });
    setPendingRequest(null);
  };

  if (loading) {
    return (
      <CosmicBackground>
        <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSub, marginTop: spacing.sm }]}>Loading your astrologer dashboard...</Text>
          </View>
        </SafeAreaView>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, shadowColor: colors.primary }]}> 
          <View style={styles.headerBadge}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>Approved Astrologer</Text>
          </View>
          <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Astrologer Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>A premium control center for your sessions, earnings and status.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroCard, { backgroundColor: colors.cardSolid, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
            <View style={styles.heroHeader}>
              <View>
                <Text style={[styles.heroTitle, { color: colors.textMain }]}>Welcome back,</Text>
                <Text style={[styles.heroName, { color: colors.primary }]}>{dashboard?.astrologer?.fullName || "Astrologer"}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: dashboard?.astrologer?.isOnline ? colors.success : colors.secondaryLight }]}> 
                <Text style={[styles.statusPillText, { color: dashboard?.astrologer?.isOnline ? colors.white : colors.textMain }]}>
                  {dashboard?.astrologer?.isOnline ? "Online" : "Offline"}
                </Text>
              </View>
            </View>

            <View style={styles.heroInfoRow}>
              <View style={[styles.heroMetric, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                <Text style={[styles.metricLabel, { color: colors.textSub }]}>Rating</Text>
                <Text style={[styles.metricValue, { color: colors.warning }]}>{dashboard?.rating?.toFixed(1) || "0.0"}</Text>
              </View>
              <View style={[styles.heroMetric, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                <Text style={[styles.metricLabel, { color: colors.textSub }]}>Reviews</Text>
                <Text style={[styles.metricValue, { color: colors.textMain }]}>{dashboard?.reviewsCount ?? 0}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Profile Overview</Text>
            <Text style={[styles.sectionText, { color: colors.textSub, marginTop: spacing.sm }]} numberOfLines={4}>{dashboard?.astrologer?.about || "Your profile summary will appear here after you complete your astrologer details."}</Text>
            <Text style={[styles.profileMeta, { color: colors.textSub, marginTop: spacing.md }]}>Specializations: {dashboard?.astrologer?.expertise?.join(", ") || "Not set"}</Text>
            <Text style={[styles.profileMeta, { color: colors.textSub, marginTop: spacing.sm }]}>Languages: {dashboard?.astrologer?.languages?.join(", ") || "Not set"}</Text>
          </View>

          <View style={[styles.statsRow, { marginTop: spacing.lg }]}> 
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Earnings</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>₹{dashboard?.earnings ?? 0}</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
              <Text style={[styles.metricLabel, { color: colors.textSub }]}>Balance</Text>
              <Text style={[styles.metricValue, { color: colors.success }]}>₹{dashboard?.balance ?? 0}</Text>
            </View>
          </View>

          {pendingRequest ? (
            <View style={[styles.pendingCard, { backgroundColor: colors.cardSolid, borderColor: colors.primary, borderRadius: borderRadius.xl }]}> 
              <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Incoming Chat Request</Text>
              <Text style={[styles.sectionText, { color: colors.textSub, marginTop: spacing.sm }]}> {pendingRequest.customerName || "A customer"} wants to start a chat.</Text>
              <Text style={[styles.sectionText, { color: colors.textSub }]}>Rate: ₹{pendingRequest.pricePerMinute || 15}/min</Text>
              <View style={styles.pendingActions}> 
                <TouchableOpacity activeOpacity={0.8} style={[styles.pendingButton, { backgroundColor: colors.success, borderRadius: borderRadius.md }]} onPress={acceptPendingRequest}> 
                  <Text style={[styles.pendingButtonText, { color: colors.white }]}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} style={[styles.pendingButton, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]} onPress={rejectPendingRequest}> 
                  <Text style={[styles.pendingButtonText, { color: colors.white }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.statusButton, { backgroundColor: dashboard?.astrologer?.isOnline ? colors.success : colors.primary, borderRadius: borderRadius.lg }]}
            onPress={toggleOnlineStatus}
            disabled={updatingStatus}
          >
            <Text style={[styles.statusButtonText, { color: colors.white }]}> {dashboard?.astrologer?.isOnline ? "Go Offline" : "Go Online"}</Text>
          </TouchableOpacity>

          <View style={[styles.actionRow, { marginTop: spacing.md }]}> 
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionButton, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={[styles.actionButtonText, { color: colors.white }]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionButton, { backgroundColor: colors.secondary, borderRadius: borderRadius.lg }]}
              onPress={() => navigation.navigate("AstrologerAnalytics")}
            >
              <Text style={[styles.actionButtonText, { color: colors.white }]}>View Analytics</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.helpButton, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}
            onPress={() => Alert.alert("Astrologer Dashboard", "Your astrologer profile is being managed by the DestiNOVA admin team.")}
          >
            <Text style={[styles.helpButtonText, { color: colors.textMain }]}>Need Help?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.logoutButton, { backgroundColor: colors.danger, borderRadius: borderRadius.lg }]}
            onPress={logout}
          >
            <Text style={[styles.logoutButtonText, { color: colors.white }]}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        <CosmicBottomBar currentRoute="AstrologerDashboard" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusText: { textAlign: "center", maxWidth: "80%" },
  content: { padding: 20, paddingBottom: 140 },
  header: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24, borderBottomWidth: 1 },
  headerBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(201,168,106,0.25)", marginBottom: 16 },
  badgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  title: { marginBottom: 6, fontSize: 28, lineHeight: 36 },
  subtitle: { fontSize: 14, lineHeight: 22, maxWidth: "85%" },
  heroCard: { padding: 24, borderWidth: 1, marginBottom: 24, shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 12 },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  heroTitle: { fontSize: 14, letterSpacing: 0.4 },
  heroName: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  statusPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  statusPillText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  heroInfoRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  heroMetric: { flex: 1, padding: 18, borderWidth: 1, borderRadius: 22 },
  profileCard: { padding: 22, borderWidth: 1, marginBottom: 22 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  metricBox: { flex: 1, padding: 18, borderWidth: 1, borderRadius: 22 },
  metricLabel: { marginBottom: 8, fontSize: 13 },
  metricValue: { fontSize: 24, fontWeight: "800" },
  cardLabel: { fontSize: 12 },
  cardValue: { fontSize: 18, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  sectionText: { lineHeight: 22, fontSize: 14 },
  profileMeta: { fontSize: 14 },
  statusButton: { marginTop: 16, paddingVertical: 18, alignItems: "center", borderRadius: 22 },
  statusButtonText: { fontSize: 16, fontWeight: "700" },
  actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 16 },
  actionButton: { flex: 1, paddingVertical: 16, alignItems: "center" },
  actionButtonText: { fontSize: 15, fontWeight: "700" },
  helpButton: { marginTop: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1 },
  helpButtonText: { fontSize: 15, fontWeight: "700" },
  logoutButton: { marginTop: 14, paddingVertical: 16, alignItems: "center" },
  logoutButtonText: { fontSize: 15, fontWeight: "700" },
});