import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../services/api";
import { getSocket, initSocket } from "../../services/socket";
import CosmicBackground from "../../components/CosmicBackground";

export default function AstrologerChatRequestsScreen({ navigation }) {
  const { colors, borderRadius } = useContext(ThemeContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const response = await api.get("/consultations/mine?status=PENDING"); setRequests(response.data.data || []); }
    catch (error) { Alert.alert("Unable to load requests", error.response?.data?.message || "Please try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    load();
    let socket;
    initSocket().then((connectedSocket) => {
      socket = connectedSocket;
      const receive = ({ session }) => setRequests((current) => current.some((item) => item._id === session?._id) ? current : [session, ...current]);
      socket.on("consultation_request", receive);
      socket.__requestListener = receive;
    });
    return () => { if (socket?.__requestListener) socket.off("consultation_request", socket.__requestListener); };
  }, [load]);
  const decide = async (request, action) => {
    try {
      const response = await api.post(`/consultations/${request._id}/${action}`);
      setRequests((current) => current.filter((item) => item._id !== request._id));
      if (action === "accept") {
        const session = response.data.data;
        navigation.replace("AstrologerSession", { sessionId: session._id, astrologerName: request.customerId?.fullName || "Customer", astrologerUserId: request.customerId?._id, sessionType: session.sessionType, costPerMinute: session.pricePerMinute });
      }
    } catch (error) { Alert.alert(`Unable to ${action}`, error.response?.data?.message || "Please try again."); }
  };
  const renderItem = ({ item }) => <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl }]}>
    <View style={styles.row}><View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}><Ionicons name="person" size={22} color={colors.primary} /></View><View style={styles.grow}><Text style={[styles.name, { color: colors.textMain }]}>{item.customerId?.fullName || "Customer"}</Text><Text style={{ color: colors.textSub }}>{item.sessionType} · ₹{item.pricePerMinute}/min</Text><Text style={{ color: colors.textSub }}>{new Date(item.createdAt).toLocaleString()}</Text></View></View>
    <View style={styles.actions}><TouchableOpacity onPress={() => decide(item, "accept")} style={[styles.button, { backgroundColor: colors.success, borderRadius: borderRadius.md }]}><Text style={{ color: colors.white }}>Accept</Text></TouchableOpacity><TouchableOpacity onPress={() => decide(item, "reject")} style={[styles.button, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}><Text style={{ color: colors.white }}>Reject</Text></TouchableOpacity></View>
  </View>;
  return <CosmicBackground><SafeAreaView style={styles.safe}><View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={colors.textMain} /></TouchableOpacity><Text style={[styles.title, { color: colors.textMain }]}>Chat Requests</Text></View>{loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : <FlatList data={requests} keyExtractor={(item) => item._id} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={[styles.empty, { color: colors.textSub }]}>No pending requests.</Text>} />}</SafeAreaView></CosmicBackground>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20 }, title: { fontSize: 22, fontWeight: "700" }, loader: { marginTop: 40 }, list: { padding: 20, paddingTop: 0 }, card: { borderWidth: 1, padding: 16, marginBottom: 12 }, row: { flexDirection: "row" }, avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 }, grow: { flex: 1, gap: 4 }, name: { fontSize: 16, fontWeight: "700" }, actions: { flexDirection: "row", gap: 10, marginTop: 16 }, button: { flex: 1, alignItems: "center", padding: 12 }, empty: { textAlign: "center", marginTop: 40 } });
