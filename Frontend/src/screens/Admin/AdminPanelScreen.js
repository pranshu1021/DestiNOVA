import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import api from "../../services/api";

export default function AdminPanelScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'users' | 'transactions'
  const [stats, setStats] = useState({ totalUsers: 0, totalAstrologers: 0, pendingAstrologers: 0, totalRevenue: 0 });
  const [pendingAstrologers, setPendingAstrologers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAdminData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, pendingRes, usersRes, txRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/astrologers/pending"),
        api.get("/admin/users"),
        api.get("/admin/transactions"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (pendingRes.data.success) setPendingAstrologers(pendingRes.data.data || []);
      if (usersRes.data.success) setUsersList(usersRes.data.data || []);
      if (txRes.data.success) setTransactionsList(txRes.data.data || []);
    } catch (err) {
      console.log("Admin load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleApproveAstrologer = async (id, approve) => {
    try {
      const res = await api.put(`/admin/astrologers/${id}/approve`, { approve });
      if (res.data.success) {
        Alert.alert("Success", res.data.message);
        loadAdminData(true);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Action failed.");
    }
  };

  const handleSuspendUser = async (id, suspend) => {
    try {
      const res = await api.put(`/admin/users/${id}/suspend`, { suspend });
      if (res.data.success) {
        Alert.alert("Success", res.data.message);
        loadAdminData(true);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Action failed.");
    }
  };

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>
              Admin Platform Control
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>
              Manage approvals, users & transactions
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.primary }]}>₹{stats.totalRevenue}</Text>
            <Text style={[styles.statLbl, { color: colors.textSub }]}>Revenue</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.warning }]}>{stats.pendingAstrologers}</Text>
            <Text style={[styles.statLbl, { color: colors.textSub }]}>Pending</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.success }]}>{stats.totalAstrologers}</Text>
            <Text style={[styles.statLbl, { color: colors.textSub }]}>Astrologers</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.textMain }]}>{stats.totalUsers}</Text>
            <Text style={[styles.statLbl, { color: colors.textSub }]}>Users</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabRow}>
          {[
            { key: "pending", label: `Pending (${pendingAstrologers.length})` },
            { key: "users", label: `Users (${usersList.length})` },
            { key: "transactions", label: "Transactions" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={{ color: isActive ? colors.white : colors.textMain, fontWeight: "600", fontSize: 12 }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAdminData(true)} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "pending" && (
              <View style={styles.sectionContainer}>
                {pendingAstrologers.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSub }]}>No pending astrologer applications.</Text>
                ) : (
                  pendingAstrologers.map((item) => (
                    <View key={item._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                      <Text style={[styles.cardName, { color: colors.textMain, fontSize: 16, fontWeight: "700" }]}>{item.fullName}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 13 }}>{item.email} | {item.phone}</Text>
                      <Text style={{ color: colors.primary, fontSize: 13, marginTop: 4 }}>Exp: {item.experienceYears} Years | Pricing: ₹{item.chatPricePerMinute}/min</Text>
                      <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 4 }}>Skills: {item.skills?.join(", ")}</Text>

                      <View style={styles.btnRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: colors.success }]}
                          onPress={() => handleApproveAstrologer(item._id, true)}
                        >
                          <Text style={styles.btnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: colors.danger }]}
                          onPress={() => handleApproveAstrologer(item._id, false)}
                        >
                          <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === "users" && (
              <View style={styles.sectionContainer}>
                {usersList.map((item) => (
                  <View key={item._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                    <View style={styles.userHeader}>
                      <View>
                        <Text style={[styles.cardName, { color: colors.textMain, fontSize: 15, fontWeight: "700" }]}>{item.fullName}</Text>
                        <Text style={{ color: colors.textSub, fontSize: 13 }}>{item.email}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.actionBtnSmall, { backgroundColor: item.isSuspended ? colors.success : colors.danger }]}
                        onPress={() => handleSuspendUser(item._id, !item.isSuspended)}
                      >
                        <Text style={styles.btnText}>{item.isSuspended ? "Activate" : "Suspend"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === "transactions" && (
              <View style={styles.sectionContainer}>
                {transactionsList.map((item) => (
                  <View key={item._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: item.type === "CREDIT" ? colors.success : colors.danger, fontWeight: "700" }}>
                        {item.type} ₹{item.amount}
                      </Text>
                      <Text style={{ color: colors.textSub, fontSize: 12 }}>{item.category}</Text>
                    </View>
                    <Text style={{ color: colors.textSub, fontSize: 13, marginTop: 4 }}>{item.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
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
  statsGrid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginVertical: 10, gap: 8 },
  statBox: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  statVal: { fontSize: 16, fontWeight: "bold" },
  statLbl: { fontSize: 11, marginTop: 2 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderWidth: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionContainer: { gap: 10 },
  card: { padding: 14, borderWidth: 1 },
  cardName: {},
  btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  actionBtnSmall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  userHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  emptyText: { textAlign: "center", marginTop: 40 },
});
