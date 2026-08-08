import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";

export default function AstrologerDetailScreen({ route, navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { astrologerId } = route.params || {};
  const currentUserId = user?.id || user?._id || user?.userId || "";
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const loadAstrologer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/astrologer/${astrologerId}`);
      setAstrologer(response.data.data);
    } catch (error) {
      console.log("Astrologer detail error:", error);
      Alert.alert("Unable to load astrologer", error.response?.data?.message || "Please try again later.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [astrologerId, navigation]);

  useEffect(() => {
    if (astrologerId) {
      loadAstrologer();
    } else {
      navigation.goBack();
    }
  }, [astrologerId, loadAstrologer, navigation]);

  const requestConsultation = async (sessionType) => {
    if (!astrologer?._id || !currentUserId) {
      Alert.alert("Login required", "Please sign in to start a chat.");
      return;
    }

    if (currentUserId === astrologer?.userId) {
      Alert.alert("Blocked", "You cannot start a chat with yourself.");
      return;
    }

    try {
      setRequesting(true);
      const response = await api.post("/consultations/request", { astrologerId: astrologer._id, sessionType });
      const session = response.data.data;

      navigation.navigate("AstrologerSession", {
        sessionId: session._id,
        astrologerId: astrologer._id,
        astrologerName: astrologer.fullName,
        astrologerUserId: astrologer.userId,
        sessionType,
        costPerMinute: session.pricePerMinute,
        pendingRequest: true,
      });
      Alert.alert("Request sent", "Waiting for astrologer to accept...");
    } catch (error) {
      Alert.alert("Request failed", error.message || "Could not send the chat request.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <CosmicBackground>
        <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSub, marginTop: spacing.sm }]}>Loading astrologer details...</Text>
          </View>
        </SafeAreaView>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.backRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.md }]}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.screenTitle, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Astrologer Profile</Text>
          </View>

          <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
            {astrologer?.profilePhoto ? (
              <Image source={{ uri: astrologer.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}> 
                <Ionicons name="person" size={42} color={colors.primary} />
              </View>
            )}
            <Text style={[styles.astroName, { color: colors.textMain }]}>{astrologer?.fullName || "Astrologer"}</Text>
            <Text style={[styles.astroMeta, { color: colors.textSub }]}>{astrologer?.expertise?.join(", ") || "Vedic Astrology"}</Text>
            <View style={styles.rowMetrics}> 
              <View style={styles.metricItem}> 
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={[styles.metricText, { color: colors.textSub }]}>{astrologer?.rating?.toFixed(1) || "4.8"}</Text>
              </View>
              <Text style={[styles.metricText, { color: colors.textSub }]}>{astrologer?.experienceYears || 0} yrs exp</Text>
            </View>
          </View>

          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>About</Text>
            <Text style={[styles.sectionText, { color: colors.textSub }]}>{astrologer?.about || "A trusted Vedic astrologer."}</Text>
          </View>

          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}> 
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Consultation</Text>
            <Text style={[styles.sectionText, { color: colors.textSub }]}>Chat: ₹{astrologer?.chatPricePerMinute || 0}/min</Text>
            <Text style={[styles.sectionText, { color: colors.textSub, marginTop: 8 }]}>Call: ₹{astrologer?.callPricePerMinute || 0}/min</Text>
            <Text style={[styles.sectionText, { color: colors.textSub, marginTop: 8 }]}>Languages: {astrologer?.languages?.join(", ") || "Hindi, English"}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionButton, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]}
            onPress={() => requestConsultation("chat")}
            disabled={requesting}
          >
            {requesting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={[styles.actionButtonText, { color: colors.white }]}>Request Chat</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionButton, { backgroundColor: colors.secondary, borderRadius: borderRadius.lg }]}
            onPress={() => requestConsultation("voice")}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Request Call</Text>
          </TouchableOpacity>
        </ScrollView>

        <CosmicBottomBar currentRoute="Home" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusText: { textAlign: "center", maxWidth: "80%" },
  content: { padding: 20, paddingBottom: 120, gap: 16 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderWidth: 1 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  screenTitle: { flex: 1 },
  headerCard: { alignItems: "center", padding: 24, borderWidth: 1 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 16, borderWidth: 1 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: 1 },
  astroName: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  astroMeta: { fontSize: 14, marginBottom: 12 },
  rowMetrics: { flexDirection: "row", alignItems: "center", gap: 16 },
  metricItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metricText: { fontSize: 14 },
  detailCard: { padding: 20, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  sectionText: { lineHeight: 22 },
  actionButton: { paddingVertical: 16, alignItems: "center", borderRadius: 12 },
  actionButtonText: { fontSize: 16, fontWeight: "700" },
});
