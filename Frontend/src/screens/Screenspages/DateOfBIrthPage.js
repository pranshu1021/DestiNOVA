import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function DateOfBirthPage() {
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (value) => {
    return value.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      /*
      Later:

      await api.put("/profile", {
        dateOfBirth: date,
      });
      */

      navigation.navigate("BirthTime");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate("BirthTime");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
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
        Step 3 of 5
      </Text>

      {/* ---------- PROGRESS ---------- */}

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: "60%" },
          ]}
        />
      </View>

      {/* ---------- ICON ---------- */}

      <View style={styles.iconContainer}>
        <Ionicons
          name="calendar"
          size={70}
          color="#4F46E5"
        />
      </View>

      {/* ---------- TITLE ---------- */}

      <Text style={styles.title}>
        Date of Birth
      </Text>

      <Text style={styles.subtitle}>
        Select your birth date to generate
        accurate astrological insights.
      </Text>

      {/* ---------- DATE CARD ---------- */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.dateCard}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={26}
          color="#4F46E5"
        />

        <Text style={styles.dateText}>
          {formatDate(date)}
        </Text>
      </TouchableOpacity>

      {/* ---------- DATE PICKER ---------- */}

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onChange}
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
        style={[
          styles.continueButton,
          loading && styles.disabledButton,
        ]}
        disabled={loading}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>
          {loading ? "Please wait..." : "Continue"}
        </Text>

        {!loading && (
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
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

    marginTop: 40,

    elevation: 5,

    shadowColor: "#4F46E5",
    shadowOpacity: 0.12,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },

  // ---------- TEXT ----------

  title: {
    marginTop: 30,
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
    paddingHorizontal: 15,
    marginBottom: 35,
  },

  // ---------- DATE CARD ----------

  dateCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    height: 70,

    borderRadius: 18,

    paddingHorizontal: 22,

    elevation: 4,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  dateText: {
    marginLeft: 16,
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
  },

  // ---------- SKIP ----------

  skipText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 18,
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