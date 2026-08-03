import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      await AsyncStorage.setItem("provider", "email");
      await login(response.data.token, response.data.user);
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Could not connect to authentication server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const response = await api.post("/auth/google", {
        idToken: userInfo.data.idToken,
      });

      await AsyncStorage.setItem("provider", "google");
      await login(response.data.token, response.data.user);
    } catch (error) {
      console.log("Google Login error:", error);
      Alert.alert("Google Login Failed", error.response?.data?.message || "Google authentication was cancelled.");
    } finally {
      setGoogleLoading(false);
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
            {/* Logo Header */}
            <View style={styles.logoSection}>
              <View style={[styles.sparkleBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="sparkles" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h1, fontWeight: typography.weights.bold }]}>
                DestiNOVA
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.body }]}>
                Enter the cosmic realm of spiritual guidance
              </Text>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>EMAIL ADDRESS</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.inputIcon} />
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>PASSWORD</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSub} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
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
                  Sign In to DestiNOVA
                </Text>
              )}
            </TouchableOpacity>

            {/* Register Footer Link */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSub, fontSize: typography.sizes.body }]}>
                New seeker?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={[styles.linkText, { color: colors.primary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                  {" Create Account"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted, fontSize: typography.sizes.caption }]}>OR CONNECT WITH</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              style={[
                styles.googleBtn,
                { backgroundColor: colors.cardSolid, borderColor: colors.border, borderRadius: borderRadius.lg, ...shadows.soft },
              ]}
            >
              {googleLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <Image
                    style={styles.googleIcon}
                    source={{
                      uri: "https://yt3.googleusercontent.com/yqq5boPOuTo3s85oxX-DJjIhkeVN187TIEvYpCekcvuPMA9HepfOQpbWUN5w6Sn8gxlBZzPG=s900-c-k-c0x00ffffff-no-rj",
                    }}
                  />
                  <Text style={[styles.googleBtnText, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>
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
  logoSection: { alignItems: "center", marginBottom: 28 },
  sparkleBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  title: { letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { textAlign: "center", lineHeight: 20 },
  inputGroup: { marginBottom: 18 },
  label: { letterSpacing: 0.5, marginBottom: 6, fontWeight: "600" },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, height: 52, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  eyeBtn: { padding: 4 },
  primaryBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 10 },
  primaryBtnText: {},
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  footerText: {},
  linkText: {},
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 22 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, letterSpacing: 0.5 },
  googleBtn: { height: 52, flexDirection: "row", justifyContent: "center", alignItems: "center", borderWidth: 1 },
  googleIcon: { width: 22, height: 22, marginRight: 10 },
  googleBtnText: {},
});
