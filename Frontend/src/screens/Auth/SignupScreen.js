import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";

export default function SignupScreen() {
  const navigation = useNavigation();
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Input Required", "Please fill all fields correctly.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/signup", {
        fullName,
        email,
        phone,
        password,
      });

      Alert.alert("Account Created", response.data.message || "Account created successfully!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "Could not connect to backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Glass Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.xl || 28,
                ...shadows.medium,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.logoSection}>
              <View style={[styles.sparkleBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="sparkles" size={26} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h1, fontWeight: typography.weights.bold }]}>
                Create Account
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>
                Join DestiNOVA & begin your spiritual journey
              </Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>FULL NAME</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Ionicons name="person-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>EMAIL ADDRESS</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Ionicons name="mail-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>MOBILE NUMBER</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Ionicons name="call-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="+91 9876543210"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>PASSWORD</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="Min 8 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>CONFIRM PASSWORD</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignup}
              disabled={loading}
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary, borderRadius: borderRadius.lg, ...shadows.primaryGlow },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.white, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                  Create My Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSub, fontSize: typography.sizes.body }]}>
                Already registered?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.linkText, { color: colors.primary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                  {" Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  card: { borderWidth: 1, padding: 24 },
  logoSection: { alignItems: "center", marginBottom: 24 },
  sparkleBadge: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  title: { letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { textAlign: "center", lineHeight: 20 },
  inputGroup: { marginBottom: 14 },
  label: { letterSpacing: 0.5, marginBottom: 4, fontWeight: "600" },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, height: 48, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  primaryBtn: { height: 50, justifyContent: "center", alignItems: "center", marginTop: 12 },
  primaryBtnText: {},
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 18 },
  footerText: {},
  linkText: {},
});
