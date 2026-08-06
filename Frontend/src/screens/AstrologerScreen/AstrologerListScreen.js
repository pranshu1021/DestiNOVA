import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import AstrologerCard from "../../components/AstrologerCard";
import api from "../../services/api";

export default function AstrologerListScreen({ navigation }) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAstrologers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/astrologer/list");
      setAstrologers(response.data.data || []);
    } catch (error) {
      console.log("Astrologer list load error:", error);
      setAstrologers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAstrologers();
  }, [loadAstrologers]);

  const renderItem = ({ item }) => (
    <AstrologerCard
      key={item._id}
      name={item.fullName || item.name}
      specialty={item.expertise ? item.expertise.join(", ") : item.about || "Vedic Astrology"}
      experience={item.experienceYears || item.experience || 0}
      rating={item.rating || 0}
      price={item.chatPricePerMinute || item.price || 0}
      image={item.profilePhoto || item.image}
      isOnline={item.isOnline}
      onPress={() => {
        if (item._id) {
          navigation.navigate("AstrologerDetail", { astrologerId: item._id });
        }
      }}
    />
  );

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
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Approved Astrologers</Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>Choose a verified Vedic astrologer for your consultation.</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSub, marginTop: spacing.sm }]}>Loading astrologers...</Text>
          </View>
        ) : astrologers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={48} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>No astrologers available</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSub, fontSize: typography.sizes.body, textAlign: "center" }]}>Approved astrologers are not available right now. Please check back later.</Text>
          </View>
        ) : (
          <FlatList
            data={astrologers}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <CosmicBottomBar currentRoute="Home" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1 },
  headerTextWrapper: { flex: 1 },
  title: { marginBottom: 4 },
  subtitle: {},
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {},
  listContent: { paddingHorizontal: 20, paddingVertical: 20 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: "700" },
  emptySubtitle: { marginTop: 8, fontSize: 14, textAlign: "center" },
});
