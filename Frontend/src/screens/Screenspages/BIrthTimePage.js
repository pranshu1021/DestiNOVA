import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

export default function BirthTimePage() {
  const navigation = useNavigation();

  // -----------------------------
  // STATES
  // -----------------------------

  const [birthTime, setBirthTime] = useState(new Date());

  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // TIME PICKER
  // -----------------------------

  const onChangeTime = (event, selectedTime) => {
    setShowPicker(false);

    if (selectedTime) {
      setBirthTime(selectedTime);
    }
  };

  // -----------------------------
  // FORMAT TIME
  // Example:
  // 07:30 AM
  // -----------------------------

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // -----------------------------
  // CONTINUE
  // Later we'll save API here
  // -----------------------------

  const handleContinue = async () => {
    try {
      setLoading(true);

      /*
      Later API

      await api.put("/profile",{
          birthTime
      })
      */

      navigation.navigate("BirthPlace");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // SKIP
  // -----------------------------

  const handleSkip = () => {
    navigation.navigate("BirthPlace");
  };

  // -----------------------------
  // BACK
  // -----------------------------

  const handleBack = () => {
    navigation.goBack();
  };

  // -----------------------------
  // JSX STARTS BELOW
  // -----------------------------

  return (    <SafeAreaView style={styles.container}>

      {/* ---------- HEADER ---------- */}

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
        Step 4 of 5
      </Text>

      {/* ---------- PROGRESS ---------- */}

      <View style={styles.progressBackground}>
        <View style={styles.progressFill} />
      </View>

      {/* ---------- ICON ---------- */}

      <View style={styles.iconContainer}>
        <Ionicons
          name="time"
          size={70}
          color="#4F46E5"
        />
      </View>

      {/* ---------- TITLE ---------- */}

      <Text style={styles.title}>
        What time were you born?
      </Text>

      <Text style={styles.subtitle}>
        Your birth time helps us calculate
        your birth chart with greater accuracy.
      </Text>

      {/* ---------- TIME CARD ---------- */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.timeCard}
        onPress={() => setShowPicker(true)}
      >

        <Text style={styles.timeLabel}>
          Birth Time
        </Text>

        <Text style={styles.timeText}>
          {formatTime(birthTime)}
        </Text>

        <Ionicons
          name="time-outline"
          size={28}
          color="#4F46E5"
        />

      </TouchableOpacity>

      {/* ---------- PICKER ---------- */}

      {showPicker && (
        <DateTimePicker
          value={birthTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
        />
      )}

      <View style={{ flex: 1 }} />

      {/* ---------- SKIP ---------- */}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>
          Skip for now
        </Text>
      </TouchableOpacity>

      {/* ---------- CONTINUE ---------- */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.continueButton}
        onPress={handleContinue}
        disabled={loading}
      >

        <Text style={styles.continueText}>
          {loading ? "Please wait..." : "Continue"}
        </Text>

        {!loading && (
          <Ionicons
            name="arrow-forward"
            size={20}
            color="white"
          />
        )}

      </TouchableOpacity>

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

  // ---------------- HEADER ----------------

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

  // ---------------- PROGRESS ----------------

  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
  },

  progressFill: {
    width: "80%",
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },

  // ---------------- ICON ----------------

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

  // ---------------- TEXT ----------------

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",

    textAlign: "center",

    marginTop: 35,
  },

  subtitle: {
    marginTop: 12,

    textAlign: "center",

    color: "#6B7280",

    fontSize: 16,

    lineHeight: 24,

    paddingHorizontal: 10,
  },

  // ---------------- CARD ----------------

  timeCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    paddingVertical: 28,

    paddingHorizontal: 24,

    marginTop: 45,

    alignItems: "center",

    elevation: 7,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  timeLabel: {
    color: "#9CA3AF",
    fontSize: 15,
    marginBottom: 12,
  },

  timeText: {
    fontSize: 34,

    fontWeight: "800",

    color: "#4F46E5",

    marginBottom: 18,
  },

  // ---------------- BUTTONS ----------------

  skipText: {
    textAlign: "center",

    color: "#6B7280",

    fontSize: 17,

    fontWeight: "600",

    marginBottom: 18,
  },

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

  continueText: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "700",

    marginRight: 8,
  },
});