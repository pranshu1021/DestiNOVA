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
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/chat/conversations");
      setConversations(response.data.data || []);
    } catch (error) {
      console.log("Astrologer sessions load error:", error);
      Alert.alert("Unable to load sessions", error.response?.data?.message || "Please try again later.");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const renderSession = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AstrologerSession", {
          sessionId: item.sessionId,
          astrologerName: item.partnerName || "Conversation",
          astrologerUserId: item.partnerId,
          sessionType: "chat",
          costPerMinute: 15,
        })}
        style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}
      >
        <View style={styles.sessionMain}>
          <View style={[styles.avatarBadge, { backgroundColor: colors.primaryLight }]}> 
            <Ionicons name="person" size={16} color={colors.primary} />
          </View>
          <View style={styles.sessionTextWrap}>
            <Text style={[styles.sessionTitle, { color: colors.textMain }]}>{item.partnerName || "Conversation"}</Text>
            <Text style={[styles.sessionSubtitle, { color: colors.textSub }]}>{item.lastMessage || "Start a chat"}</Text>
          </View>
        </View>
        <View style={styles.sessionMeta}>
          {item.unreadCount ? (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}> 
              <Text style={[styles.unreadText, { color: colors.white }]}>{item.unreadCount}</Text>
            </View>
          ) : null}
          <Text style={[styles.sessionTime, { color: colors.textSub }]}>{item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleDateString() : "New"}</Text>
        </View>
      </TouchableOpacity>
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
          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>No recent sessions yet</Text>
              <Text style={[styles.emptyMessage, { color: colors.textSub }]}>Your session activity will appear here after your first consultation.</Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.sessionId}
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
  sessionCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, marginBottom: 14, borderWidth: 1 },
  sessionMain: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarBadge: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", marginRight: 12 },
  sessionTextWrap: { flex: 1 },
  sessionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  sessionSubtitle: { fontSize: 13, lineHeight: 20 },
  sessionMeta: { alignItems: "flex-end", marginLeft: 10 },
  unreadBadge: { minWidth: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", paddingHorizontal: 6, marginBottom: 6 },
  unreadText: { fontSize: 12, fontWeight: "700" },
  sessionTime: { fontSize: 12 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: "700" },
  emptyMessage: { marginTop: 8, fontSize: 14, textAlign: "center" },
  listContent: { paddingBottom: 120 },
});
