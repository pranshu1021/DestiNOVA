import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function GenderPage() {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // CONTINUE
  // -----------------------------

  const handleContinue = async () => {
    if (!gender) return;

    try {
      setLoading(true);

      // Later API
      // await api.put("/profile",{ gender })

      navigation.navigate("DateOfBirth");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= HEADER ================= */}

      <View>

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

        <Text style={styles.stepText}>
          Step 2 of 5
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: "40%" },
            ]}
          />
        </View>

      </View>

      {/* ================= CONTENT ================= */}

      <View style={styles.content}>

        <View style={styles.iconContainer}>
          <Ionicons
            name="people"
            size={70}
            color="#4F46E5"
          />
        </View>

        <Text style={styles.title}>
          Select your gender
        </Text>

        <Text style={styles.subtitle}>
          This helps us personalize
          your astrology profile.
        </Text>

        {/* ---------- Male ---------- */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.genderCard,
            gender === "Male" &&
              styles.selectedCard,
          ]}
          onPress={() => setGender("Male")}
        >
          <Ionicons
            name="male"
            size={30}
            color={
              gender === "Male"
                ? "#4F46E5"
                : "#6B7280"
            }
          />

          <Text
            style={[
              styles.genderText,
              gender === "Male" &&
                styles.selectedText,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

        {/* ---------- Female ---------- */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.genderCard,
            gender === "Female" &&
              styles.selectedCard,
          ]}
          onPress={() => setGender("Female")}
        >
          <Ionicons
            name="female"
            size={30}
            color={
              gender === "Female"
                ? "#4F46E5"
                : "#6B7280"
            }
          />

          <Text
            style={[
              styles.genderText,
              gender === "Female" &&
                styles.selectedText,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>

        {/* ---------- Prefer Not To Say ---------- */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.genderCard,
            gender === "Prefer not to say" &&
              styles.selectedCard,
          ]}
          onPress={() =>
            setGender("Prefer not to say")
          }
        >
          <Ionicons
            name="person-outline"
            size={30}
            color={
              gender === "Prefer not to say"
                ? "#4F46E5"
                : "#6B7280"
            }
          />

          <Text
            style={[
              styles.genderText,
              gender === "Prefer not to say" &&
                styles.selectedText,
            ]}
          >
            Prefer not to say
          </Text>
        </TouchableOpacity>

      </View>

      {/* ================= FOOTER ================= */}

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.continueButton,
            (!gender || loading) &&
              styles.disabledButton,
          ]}
          disabled={!gender || loading}
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
      </View>

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

// ================= HEADER =================

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
  marginTop: 24,
  fontSize: 15,
  color: "#6B7280",
  fontWeight: "600",
},

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

// ================= CONTENT =================

content: {
  flex: 1,
  justifyContent: "center",
},

iconContainer: {
  width: 130,
  height: 130,
  borderRadius: 65,
  backgroundColor: "#EEF2FF",

  justifyContent: "center",
  alignItems: "center",

  alignSelf: "center",

  marginBottom: 28,

  elevation: 5,

  shadowColor: "#4F46E5",
  shadowOpacity: 0.12,
  shadowRadius: 15,
  shadowOffset: {
    width: 0,
    height: 8,
  },
},

title: {
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
  paddingHorizontal: 18,
  marginBottom: 28,
},// ================= GENDER CARD =================

genderCard: {
  flexDirection: "row",
  alignItems: "center",

  backgroundColor: "#FFFFFF",

  height: 70,

  borderRadius: 18,

  paddingHorizontal: 22,

  marginBottom: 16,

  elevation: 4,

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 5,
  },
},

selectedCard: {
  borderWidth: 2,
  borderColor: "#4F46E5",
  backgroundColor: "#EEF2FF",
},

genderText: {
  marginLeft: 18,
  fontSize: 18,
  fontWeight: "600",
  color: "#374151",
},

selectedText: {
  color: "#4F46E5",
  fontWeight: "700",
},

// ================= FOOTER =================

footer: {
  paddingTop: 12,
},

// ================= BUTTON =================

continueButton: {
  height: 60,
  borderRadius: 18,
  backgroundColor: "#4F46E5",

  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",

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
