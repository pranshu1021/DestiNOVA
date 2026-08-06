import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../services/api";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";

export default function WalletScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechargeLoading, setRechargeLoading] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/wallet/balance");
      const data = response.data.data || {};
      setBalance(data.balance ?? 0);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.log("Wallet load error:", error);
      Alert.alert("Unable to load wallet", error.response?.data?.message || "Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRecharge = useCallback(async (amount) => {
    try {
      setRechargeLoading(true);
      const orderResponse = await api.post("/wallet/create-order", { amount });
      const orderData = orderResponse.data.data || {};
      const verifyResponse = await api.post("/wallet/verify-payment", {
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: "mock_sig",
      });
      const verified = verifyResponse.data.data || {};
      setBalance(verified.walletBalance ?? balance + amount);
      Alert.alert("Recharge successful", `₹${amount} added to your wallet.`);
      await loadBalance();
    } catch (error) {
      console.log("Recharge failed:", error);
      Alert.alert("Recharge failed", error.response?.data?.message || "Please try again later.");
    } finally {
      setRechargeLoading(false);
    }
  }, [balance, loadBalance]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionRow, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.soft }]}> 
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionTitle, { color: colors.textMain }]}>{item.category.replace(/_/g, " ")}</Text>
        <Text style={[styles.transactionSubtitle, { color: colors.textSub }]}>{item.description || item.type}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.type === "CREDIT" ? colors.success : colors.danger }]}>₹{item.amount}</Text>
    </View>
  );

  if (loading) {
    return (
      <CosmicBackground>
        <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSub, marginTop: spacing.sm }]}>Loading wallet...</Text>
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
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>My Wallet</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>Manage your balance and recent activity.</Text>
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
          <Text style={[styles.balanceLabel, { color: colors.textSub }]}>Current Balance</Text>
          <Text style={[styles.balanceValue, { color: colors.primary }]}>₹{balance}</Text>
          <Text style={[styles.balanceNote, { color: colors.textSub }]}>Wallet balance is updated after every recharge or session deduction.</Text>
        </View>

        <View style={styles.rechargeActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionChip, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg }]}
            onPress={() => handleRecharge(100)}
            disabled={rechargeLoading}
          >
            <Text style={[styles.actionChipText, { color: colors.primary }]}>Add ₹100</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionChip, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg }]}
            onPress={() => handleRecharge(250)}
            disabled={rechargeLoading}
          >
            <Text style={[styles.actionChipText, { color: colors.primary }]}>Add ₹250</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionChip, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg }]}
            onPress={() => handleRecharge(500)}
            disabled={rechargeLoading}
          >
            <Text style={[styles.actionChipText, { color: colors.primary }]}>Add ₹500</Text>
          </TouchableOpacity>
        </View>
        {rechargeLoading ? (
          <Text style={[styles.rechargeNote, { color: colors.primary }]}>Processing recharge...</Text>
        ) : (
          <Text style={[styles.rechargeNote, { color: colors.textSub }]}>Tap an amount to recharge your wallet instantly.</Text>
        )}

        <View style={styles.transactionHeader}> 
          <Text style={[styles.transactionsTitle, { color: colors.textMain }]}>Recent Transactions</Text>
          <Text style={[styles.transactionsCount, { color: colors.textSub }]}>{transactions.length} items</Text>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id || String(item.createdAt) + item.amount}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSub }]}>No wallet activity yet.</Text>
            </View>
          )}
        />

        <CosmicBottomBar currentRoute="Wallet" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1 },
  headerTextWrapper: { flex: 1 },
  title: { marginBottom: 4 },
  subtitle: {},
  balanceCard: { margin: 20, padding: 24, borderWidth: 1 },
  balanceLabel: { fontSize: 14, marginBottom: 8 },
  balanceValue: { fontSize: 36, fontWeight: "700", marginBottom: 10 },
  balanceNote: { lineHeight: 22 },
  rechargeButton: { marginHorizontal: 20, paddingVertical: 16, alignItems: "center" },
  rechargeButtonText: { fontSize: 16, fontWeight: "700" },
  transactionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 20, marginTop: 10 },
  transactionsTitle: { fontSize: 16, fontWeight: "700" },
  transactionsCount: { fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 12, gap: 12 },
  transactionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderWidth: 1 },
  transactionInfo: { flex: 1, paddingRight: 10 },
  transactionTitle: { fontSize: 15, fontWeight: "700" },
  transactionSubtitle: { marginTop: 4, fontSize: 13 },
  transactionAmount: { fontSize: 15, fontWeight: "700" },
  rechargeActions: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, gap: 12, marginBottom: 12 },
  actionChip: { flex: 1, paddingVertical: 14, alignItems: "center", borderWidth: 1 },
  actionChipText: { fontSize: 15, fontWeight: "700" },
  rechargeNote: { marginHorizontal: 20, marginBottom: 20, fontSize: 13 },
  emptyContainer: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14 },
});