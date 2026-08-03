import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";
import api from "../../services/api";

const renderSafeText = (val, fallback = "") => {
  if (!val) return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") return val.text || val.message || fallback;
  return fallback;
};

export default function AIChatScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get("/ai/history");
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.log("AI Chat history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const textToSend = inputText.trim();
    setInputText("");

    const tempUserMsg = { _id: String(Date.now()), role: "user", text: textToSend, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      setSending(true);
      const res = await api.post("/ai/chat", { message: textToSend });
      if (res.data.success && res.data.data?.messages) {
        setMessages(res.data.data.messages);
      }
    } catch (err) {
      console.log("AI Chat send error:", err);
      const errMsg = {
        _id: String(Date.now() + 1),
        role: "assistant",
        text: "Unable to connect to cosmic wisdom right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
        {!isUser && (
          <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary, borderBottomRightRadius: 2 }
              : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 2 },
            borderRadius.lg,
            shadows.soft,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              { color: isUser ? colors.white : colors.textMain, fontSize: typography.sizes.body, lineHeight: 22 },
            ]}
          >
            {renderSafeText(item.text)}
          </Text>
        </View>
      </View>
    );
  };

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
              Astro AI Guide
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>
              Gemini Powered Vedic Consultations
            </Text>
          </View>
          <View style={[styles.onlineBadge, { backgroundColor: colors.success + "20" }]}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.onlineText, { color: colors.success, fontSize: typography.sizes.caption }]}>Online</Text>
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {loadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSub, marginTop: 12 }]}>Reading celestial logs...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => item._id || item.id || String(index)}
              renderItem={renderMessageItem}
              contentContainerStyle={[styles.chatContent, { paddingHorizontal: spacing.xxl, paddingBottom: 110 }]}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="planet-outline" size={48} color={colors.primary} />
                  <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                    Ask Astro AI Anything
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.textSub, fontSize: typography.sizes.body, textAlign: "center" }]}>
                    Ask about love, career, Kundli Yogas, or daily guidance!
                  </Text>
                </View>
              }
            />
          )}

          {sending && (
            <View style={[styles.typingRow, { paddingHorizontal: spacing.xxl }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.typingText, { color: colors.textSub, fontSize: typography.sizes.small, marginLeft: 8 }]}>
                DestiNOVA AI is consulting the stars...
              </Text>
            </View>
          )}

          {/* Input Footer */}
          <View style={[styles.inputFooter, { backgroundColor: colors.card, borderTopColor: colors.border, paddingHorizontal: spacing.xxl, paddingVertical: spacing.sm, paddingBottom: 85 }]}>
            <TextInput
              style={[styles.textInput, { color: colors.textMain, backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}
              placeholder="Ask about love, money, or career..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.sendBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.lg, ...shadows.primaryGlow }]}
              onPress={handleSend}
              disabled={sending || !inputText.trim()}
            >
              <Ionicons name="send" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <CosmicBottomBar currentRoute="AIChat" />
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
  onlineBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {},
  chatContent: { flexGrow: 1, paddingTop: 16, gap: 12 },
  messageRow: { flexDirection: "row", marginVertical: 4, alignItems: "flex-end" },
  userRow: { justifyContent: "flex-end" },
  assistantRow: { justifyContent: "flex-start" },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: "center", alignItems: "center", marginRight: 8 },
  bubble: { maxWidth: "82%", padding: 14 },
  bubbleText: {},
  typingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  typingText: {},
  emptyContainer: { flex: 1, minHeight: 300, justifyContent: "center", alignItems: "center", gap: 10 },
  emptyTitle: {},
  emptySub: { maxWidth: 280, lineHeight: 20 },
  inputFooter: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, gap: 10 },
  textInput: { flex: 1, height: 48, paddingHorizontal: 16, borderWidth: 1 },
  sendBtn: { width: 48, height: 48, justifyContent: "center", alignItems: "center" },
});
