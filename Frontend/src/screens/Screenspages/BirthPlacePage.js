import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { searchPlaces } from "../../services/locationIQ";

export default function BirthPlacePage() {
  const navigation = useNavigation();

  // ==========================
  // States
  // ==========================

  const [search, setSearch] = useState("");

  const [places, setPlaces] = useState([]);

  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [loading, setLoading] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(null);

  const [latitude, setLatitude] = useState(null);

  const [longitude, setLongitude] = useState(null);

  const [error, setError] = useState("");

  // debounce timer

  const debounceRef = useRef(null);

  // ==========================
  // SEARCH
  // ==========================

  useEffect(() => {

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (search.trim().length < 2) {
      setPlaces([]);
      setLoadingPlaces(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {

      try {

        setLoadingPlaces(true);

        setError("");

        const result = await searchPlaces(search);

        setPlaces(result);

        if (result.length === 0) {
          setError("No places found");
        }

      } catch (err) {

        console.log(err);

        setError("Unable to search location");

      } finally {

        setLoadingPlaces(false);

      }

    }, 450);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };

  }, [search]);

  // ==========================
  // SELECT LOCATION
  // ==========================

  const handleSelect = (item) => {

    Keyboard.dismiss();

    setSelectedPlace(item);

    setSearch(item.display_name);

    setLatitude(item.lat);

    setLongitude(item.lon);

    setPlaces([]);

  };

  // ==========================
  // CONTINUE
  // ==========================

  const handleContinue = async () => {

    if (!selectedPlace) return;

    try {

      setLoading(true);

      /*
      Backend later

      await api.put("/profile",{

          birthPlace:selectedPlace.display_name,

          latitude,

          longitude

      });

      */

      navigation.navigate("Home");

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  };

  // ==========================
  // Skip
  // ==========================

  const handleSkip = () => {

    navigation.navigate("Home");

  };

  // ==========================
  // Back
  // ==========================

  const handleBack = () => {

    navigation.goBack();

  };

  // ==========================
  // JSX
  // ==========================

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
        Step 5 of 5
      </Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: "100%" },
          ]}
        />
      </View>

      {/* ---------- ICON ---------- */}

      <View style={styles.iconContainer}>
        <Ionicons
          name="location"
          size={70}
          color="#4F46E5"
        />
      </View>

      {/* ---------- TITLE ---------- */}

      <Text style={styles.title}>
        Where were you born?
      </Text>

      <Text style={styles.subtitle}>
        Search your city or town. We'll use this
        location for accurate birth chart calculations.
      </Text>

      {/* ---------- SEARCH ---------- */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search"
          size={22}
          color="#9CA3AF"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search city, town or village..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="words"
        />

        {loadingPlaces && (
          <ActivityIndicator
            size="small"
            color="#4F46E5"
          />
        )}

      </View>

      {/* ---------- ERROR ---------- */}

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* ---------- RESULTS ---------- */}

      {places.length > 0 && (

        <FlatList
          data={places}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.place_id.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.resultsList}
          renderItem={({ item }) => (

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.placeCard,
                selectedPlace?.place_id === item.place_id &&
                  styles.selectedCard,
              ]}
              onPress={() => handleSelect(item)}
            >

              <Ionicons
                name="location-outline"
                size={22}
                color="#4F46E5"
              />

              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                }}
              >

                <Text
                  numberOfLines={2}
                  style={styles.placeText}
                >
                  {item.display_name}
                </Text>

              </View>

              {selectedPlace?.place_id === item.place_id && (

                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#22C55E"
                />

              )}

            </TouchableOpacity>

          )}
        />

      )}

      {/* ---------- SELECTED ---------- */}

      {selectedPlace && (

        <View style={styles.selectedContainer}>

          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#22C55E"
          />

          <View style={{ marginLeft: 10, flex: 1 }}>

            <Text style={styles.selectedTitle}>
              Selected Location
            </Text>

            <Text style={styles.selectedPlace}>
              {selectedPlace.display_name}
            </Text>

          </View>

        </View>

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

      {/* ---------- FINISH ---------- */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.continueButton,
          (!selectedPlace || loading) &&
            styles.disabledButton,
        ]}
        disabled={!selectedPlace || loading}
        onPress={handleContinue}
      >

        <Text style={styles.continueText}>
          {loading ? "Saving..." : "Finish"}
        </Text>

        {!loading && (

          <Ionicons
            name="checkmark"
            size={22}
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
    marginTop: 28,
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
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

    marginTop: 35,

    elevation: 6,

    shadowColor: "#4F46E5",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },

  // ---------- TEXT ----------

  title: {
    marginTop: 28,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },

  subtitle: {
    marginTop: 12,
    marginBottom: 25,

    textAlign: "center",

    color: "#6B7280",

    fontSize: 16,

    lineHeight: 24,
  },

  // ---------- SEARCH ----------

  searchContainer: {
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

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#111827",
  },

  // ---------- ERROR ----------

  errorText: {
    marginTop: 12,
    color: "#EF4444",
    textAlign: "center",
    fontWeight: "600",
  },

  // ---------- RESULTS ----------

  resultsList: {
    marginTop: 20,
    maxHeight: 260,
  },

  placeCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

    marginBottom: 12,

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },

  placeText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },

  // ---------- SELECTED ----------

  selectedContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 20,

    backgroundColor: "#ECFDF5",

    borderRadius: 18,

    padding: 18,

    borderWidth: 1,

    borderColor: "#BBF7D0",
  },

  selectedTitle: {
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 2,
  },

  selectedPlace: {
    color: "#374151",
    lineHeight: 21,
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

    elevation: 8,

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