import React, { useContext, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import api from "../../services/api";

export default function NotificationSettingsScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const initialSettings = user?.notificationSettings || {
    dailyHoroscope: true,
    muhuratReminders: true,
    festivalReminders: true,
  };

  const [dailyHoroscope, setDailyHoroscope] = useState(initialSettings.dailyHoroscope ?? true);
  const [muhuratReminders, setMuhuratReminders] = useState(initialSettings.muhuratReminders ?? true);
  const [festivalReminders, setFestivalReminders] = useState(initialSettings.festivalReminders ?? true);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key, val, setter) => {
    setter(val);
    const updatedSettings = {
      dailyHoroscope: key === "dailyHoroscope" ? val : dailyHoroscope,
      muhuratReminders: key === "muhuratReminders" ? val : muhuratReminders,
      festivalReminders: key === "festivalReminders" ? val : festivalReminders,
    };

    try {
      setSaving(true);
      const res = await api.put("/auth/update-profile", {
        notificationSettings: updatedSettings,
      });

      if (res.data.success && res.data.user) {
        await updateUser(res.data.user);
      }
    } catch (err) {
      console.log("Notification update error:", err);
    } finally {
      setSaving(false);
    }
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
          <View>
            <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>
              Notifications
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>
              Manage cosmic alerts & reminders
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xxl }]} showsVerticalScrollIndicator={false}>
          {/* Daily Horoscope */}
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="planet-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.cardTitle, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                Daily Horoscope Alert
              </Text>
              <Text style={[styles.cardSub, { color: colors.textSub, fontSize: typography.sizes.small }]}>
                Receive morning cosmic predictions tailored to your sun sign
              </Text>
            </View>
            <Switch
              value={dailyHoroscope}
              onValueChange={(val) => handleToggle("dailyHoroscope", val, setDailyHoroscope)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Muhurat Reminders */}
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={22} color={colors.success} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.cardTitle, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                Shubh Muhurat Reminders
              </Text>
              <Text style={[styles.cardSub, { color: colors.textSub, fontSize: typography.sizes.small }]}>
                Get notified during auspicious daily timings (Abhijit Kaal)
              </Text>
            </View>
            <Switch
              value={muhuratReminders}
              onValueChange={(val) => handleToggle("muhuratReminders", val, setMuhuratReminders)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Festival Reminders */}
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles-outline" size={22} color={colors.warning || "#F59E0B"} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.cardTitle, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                Festivals & Vrat Alerts
              </Text>
              <Text style={[styles.cardSub, { color: colors.textSub, fontSize: typography.sizes.small }]}>
                Timely reminders for major Ekadashi, Purnima, and Amavasya tithis
              </Text>
            </View>
            <Switch
              value={festivalReminders}
              onValueChange={(val) => handleToggle("festivalReminders", val, setFestivalReminders)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: {},
  subtitle: { marginTop: 2 },
  content: { gap: 16 },
  settingCard: { flexDirection: "row", alignItems: "center", padding: 16, borderWidth: 1, gap: 12 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  textWrapper: { flex: 1 },
  cardTitle: { marginBottom: 2 },
  cardSub: { lineHeight: 18 },
});
