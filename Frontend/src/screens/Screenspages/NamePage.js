import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native";
export default function NamePage() {
  const navigation = useNavigation();

  // -----------------------------
  // STATES
  // -----------------------------

  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // CONTINUE
  // -----------------------------

  const handleContinue = async () => {
    if (!fullName.trim()) return;

    try {
      setLoading(true);

      /*
      Later API

      await api.put("/profile",{
          fullName
      });

      */

      navigation.navigate("Gender");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // BACK
  // -----------------------------

  const handleBack = () => {
    navigation.goBack();
  };

  // -----------------------------
  // JSX STARTS
  // -----------------------------

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <KeyboardAwareScrollView
  contentContainerStyle={{ flexGrow: 1 }}
  enableOnAndroid
  keyboardShouldPersistTaps="handled"
>
                {/* ---------- HEADER ---------- */}
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#4F46E5"
          />
        </TouchableOpacity>

        {/* ---------- STEP ---------- */}

        <Text style={styles.stepText}>
          Step 1 of 5
        </Text>

        {/* ---------- PROGRESS ---------- */}

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: "20%" },
            ]}
          />
        </View>

        {/* ---------- ICON ---------- */}

        <View style={styles.iconContainer}>
          <Ionicons
            name="person"
            size={70}
            color="#4F46E5"
          />
        </View>

        {/* ---------- TITLE ---------- */}

        <Text style={styles.title}>
          What's your name?
        </Text>

        <Text style={styles.subtitle}>
          This helps personalize your
          astrology experience.
        </Text>

        {/* ---------- INPUT ---------- */}

        <View style={styles.inputContainer}>

          <Ionicons
            name="person-outline"
            size={22}
            color="#9CA3AF"
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />

        </View>

        <View style={{ flex: 1 }} />

        {/* ---------- CONTINUE ---------- */}

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!fullName.trim() || loading) &&
              styles.disabledButton,
          ]}
          activeOpacity={0.9}
          disabled={!fullName.trim() || loading}
          onPress={handleContinue}
        >

          <Text style={styles.continueText}>
            {loading
              ? "Please wait..."
              : "Continue"}
          </Text>

          {!loading && (
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          )}

        </TouchableOpacity>
</ScrollView>
</KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    paddingHorizontal: 24,
    paddingTop: 15,
  },

  // ---------- HEADER ----------

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    elevation: 4,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  stepText: {
    marginTop: 30,
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },

  // ---------- PROGRESS ----------

  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },

  // ---------- ICON ----------

  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,

    backgroundColor: "#EEF2FF",

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",

    marginTop: 45,

    elevation: 5,

    shadowColor: "#4F46E5",
    shadowOpacity: 0.12,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },

  // ---------- TITLE ----------

  title: {
    marginTop: 35,
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  // ---------- INPUT ----------

  inputContainer: {
    marginTop: 45,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    paddingHorizontal: 18,

    height: 60,

    elevation: 5,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 17,
    color: "#111827",
  },

  // ---------- BUTTON ----------

  continueButton: {
    height: 60,
    borderRadius: 18,
    backgroundColor: "#4F46E5",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 25,

    elevation: 7,

    shadowColor: "#4F46E5",
    shadowOpacity: 0.30,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },

  disabledButton: {
    backgroundColor: "#A5B4FC",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
});