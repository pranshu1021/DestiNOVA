import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnboardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function NamePage() {
  const navigation = useNavigation();
  const { user, updateUser } = useContext(AuthContext);
  const { colors, borderRadius, shadows } = useContext(ThemeContext);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = async () => {
    if (!fullName.trim()) return;

    try {
      setLoading(true);
      const response = await api.put("/update-profile", {
        fullName: fullName.trim(),
      });

      if (response.data.success) {
        await updateUser(response.data.user);
        navigation.navigate("Gender");
      } else {
        Alert.alert("Error", response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.log("NamePage Error:", error);
      Alert.alert(
        "Connection Error",
        error.response?.data?.message || "Failed to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingLayout
      onBack={handleBack}
      currentStep={1}
      iconName="person"
      title="What's your name?"
      subtitle="This helps personalize your astrology experience."
      isScrollable={true}
      onContinue={handleContinue}
      continueDisabled={!fullName.trim()}
      continueLoading={loading}
    >
      <View style={[
        styles.inputContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: borderRadius.md,
          ...shadows.soft,
        },
        isFocused && { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.08 }
      ]}>
        <Ionicons
          name="person-outline"
          size={20}
          color={isFocused ? colors.primary : colors.textMuted}
        />
        <TextInput
          style={[styles.input, { color: colors.textMain }]}
          placeholder="Enter your full name"
          placeholderTextColor={colors.textMuted}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 35,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
});