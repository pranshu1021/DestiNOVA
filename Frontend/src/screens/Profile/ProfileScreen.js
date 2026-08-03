import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { searchPlaces } from "../../services/locationIQ";
import CosmicBackground from "../../components/CosmicBackground";
import CosmicBottomBar from "../../components/CosmicBottomBar";
import api from "../../services/api";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useContext(AuthContext);
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useContext(ThemeContext);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "");

  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date()
  );
  const [birthTime, setBirthTime] = useState(user?.birthTime || "12:00 PM");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [birthPlace, setBirthPlace] = useState(user?.birthPlace || "");
  const [latitude, setLatitude] = useState(user?.birthLatitude || null);
  const [longitude, setLongitude] = useState(user?.birthLongitude || null);

  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const debounceRef = useRef(null);

  const handlePlaceSearch = (text) => {
    setBirthPlace(text);
    if (text.trim().length < 2) {
      setPlaces([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingPlaces(true);
        const result = await searchPlaces(text);
        setPlaces(result);
      } catch (err) {
        console.log("Autocomplete Error:", err);
      } finally {
        setLoadingPlaces(false);
      }
    }, 450);
  };

  const handleSelectPlace = (item) => {
    setBirthPlace(item.display_name);
    setLatitude(Number(item.lat));
    setLongitude(Number(item.lon));
    setPlaces([]);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const timeStr = selectedTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setBirthTime(timeStr);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not Added";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Required Field", "Name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const updateFields = {};
      if (fullName.trim() !== user?.fullName) updateFields.fullName = fullName.trim();
      if (phone.trim() !== user?.phone) updateFields.phone = phone.trim();
      if (gender !== user?.gender) updateFields.gender = gender;

      const userDOB = user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString() : null;
      const selectDOB = dateOfBirth.toISOString();
      if (selectDOB !== userDOB) updateFields.dateOfBirth = selectDOB;

      if (birthTime !== user?.birthTime) updateFields.birthTime = birthTime;
      if (birthPlace !== user?.birthPlace) {
        updateFields.birthPlace = birthPlace;
        updateFields.birthLatitude = latitude;
        updateFields.birthLongitude = longitude;
      }

      if (Object.keys(updateFields).length === 0) {
        setIsEditing(false);
        setLoading(false);
        return;
      }

      const response = await api.put("/auth/update-profile", updateFields);

      if (response.data.success) {
        await updateUser(response.data.user);
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        Alert.alert("Error", response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.log("ProfileSave Error:", error);
      Alert.alert("Error", "Could not save profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setGender(user?.gender || "");
    setDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date());
    setBirthTime(user?.birthTime || "12:00 PM");
    setBirthPlace(user?.birthPlace || "");
    setLatitude(user?.birthLatitude || null);
    setLongitude(user?.birthLongitude || null);
    setPlaces([]);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primaryLight }]}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.textMain }]}>
            Seeker Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Area */}
            <View style={[styles.avatarSection, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingVertical: spacing.xxl }]}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={[styles.avatar, { borderColor: colors.primary }]} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Ionicons name="person" size={44} color={colors.primary} />
                </View>
              )}
              <Text style={[styles.profileName, { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textMain }]}>
                {user?.fullName}
              </Text>
              <Text style={[styles.profileEmail, { fontSize: typography.sizes.body, color: colors.textSub }]}>
                {user?.email}
              </Text>
            </View>

            {/* VIEW MODE CONTAINER */}
            {!isEditing ? (
              <View style={[styles.infoSection, { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg }]}>
                {/* Account Details */}
                <Text style={[styles.sectionHeader, { fontSize: typography.sizes.large, fontWeight: typography.weights.bold, color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
                  Personal Details
                </Text>

                <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: spacing.lg, ...shadows.soft }]}>
                  <View style={[styles.infoRow, { paddingVertical: spacing.lg }]}>
                    <Text style={[styles.infoLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textSub }]}>Full Name</Text>
                    <Text style={[styles.infoValue, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>{user?.fullName}</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={[styles.infoRow, { paddingVertical: spacing.lg }]}>
                    <Text style={[styles.infoLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textSub }]}>Email</Text>
                    <Text style={[styles.infoValue, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>{user?.email}</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <TouchableOpacity
                    activeOpacity={user?.phone ? 1 : 0.7}
                    onPress={() => {
                      if (!user?.phone) handleStartEdit();
                    }}
                    style={[styles.infoRow, { paddingVertical: spacing.lg }]}
                  >
                    <Text style={[styles.infoLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textSub }]}>Phone Number</Text>
                    <Text style={[
                      styles.infoValue,
                      { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain },
                      !user?.phone && [styles.notAddedText, { color: colors.warning }]
                    ]}>
                      {user?.phone || "Not Added"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Astrology details */}
                <Text style={[styles.sectionHeader, { fontSize: typography.sizes.large, fontWeight: typography.weights.bold, color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
                  Vedic Birth Details
                </Text>

                <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: spacing.lg, ...shadows.soft }]}>
                  <View style={[styles.infoRow, { paddingVertical: spacing.lg }]}>
                    <Text style={[styles.infoLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textSub }]}>Gender</Text>
                    <Text style={[styles.infoValue, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>{user?.gender || "Not Added"}</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={[styles.infoRow, { paddingVertical: spacing.lg }]}>
                    <Text style={[styles.infoLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textSub }]}>Date of Birth</Text>
                    <Text style={[styles.infoValue, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>{formatDate(user?.dateOfBirth)}</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={[styles.infoRow, { paddingVertical: spacing.lg }]}>
                    <Text style={[styles.infoLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textSub }]}>Time of Birth</Text>
                    <Text style={[styles.infoValue, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>{user?.birthTime || "Not Added"}</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={[styles.infoRow, { paddingVertical: spacing.lg }]}>
                    <Text style={[styles.infoLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.textSub }]}>Place of Birth</Text>
                    <Text numberOfLines={2} style={[styles.infoValue, styles.wrapText, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>
                      {user?.birthPlace || "Not Added"}
                    </Text>
                  </View>
                </View>
                

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.editBtn, { backgroundColor: colors.primary, marginTop: spacing.xl, borderRadius: borderRadius.lg, ...shadows.primaryGlow }]}
                  onPress={handleStartEdit}
                >
                  <Ionicons name="create-outline" size={20} color={colors.white} />
                  <Text style={[styles.editBtnText, { fontSize: typography.sizes.large, fontWeight: typography.weights.bold, color: colors.white }]}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* EDIT MODE CONTAINER */
              <View style={[styles.infoSection, { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg }]}>
                <Text style={[styles.sectionHeader, { fontSize: typography.sizes.large, fontWeight: typography.weights.bold, color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
                  Edit Details
                </Text>

                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Full Name
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <TextInput
                    style={[styles.textInput, { fontSize: typography.sizes.body, color: colors.textMain }]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter full name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Phone Number
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                  <TextInput
                    style={[styles.textInput, { fontSize: typography.sizes.body, color: colors.textMain }]}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Gender
                </Text>
                <View style={styles.genderOptions}>
                  {["Male", "Female", "Other"].map((g) => {
                    const isSelected = gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        activeOpacity={0.8}
                        style={[
                          styles.genderBtn,
                          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.sm },
                          isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                        ]}
                        onPress={() => setGender(g)}
                      >
                        <Text
                          style={[
                            styles.genderBtnText,
                            { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub },
                            isSelected && { color: colors.primary }
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Date of Birth
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.pickerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.pickerCardText, { fontSize: typography.sizes.body, color: colors.textMain, fontWeight: typography.weights.medium }]}>
                    {dateOfBirth.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}

                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Time of Birth
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.pickerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.pickerCardText, { fontSize: typography.sizes.body, color: colors.textMain, fontWeight: typography.weights.medium }]}>
                    {birthTime}
                  </Text>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}

                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Birth Place
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md },
                    searchFocused && { borderColor: colors.primary },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { fontSize: typography.sizes.body, color: colors.textMain }]}
                    value={birthPlace}
                    onChangeText={handlePlaceSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search city..."
                    placeholderTextColor={colors.textMuted}
                  />
                  {loadingPlaces && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {places.length > 0 && (
                  <View style={[styles.suggestionsBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                    {places.map((place) => (
                      <TouchableOpacity
                        key={place.place_id}
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectPlace(place)}
                      >
                        <Ionicons name="location-outline" size={18} color={colors.primary} />
                        <Text numberOfLines={1} style={[styles.suggestionItemText, { fontSize: typography.sizes.body, color: colors.textMain }]}>
                          {place.display_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={[styles.actionBtnRow, { marginTop: spacing.xl }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.actionBtn, styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
                    onPress={handleCancel}
                    disabled={loading}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textSub, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.actionBtn, styles.saveBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md, ...shadows.primaryGlow }]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={[styles.saveBtnText, { color: colors.white, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <CosmicBottomBar currentRoute="Profile" />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {},
  scrollContent: {},
  avatarSection: {
    alignItems: "center",
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    marginBottom: 8,
  },
  profileName: {},
  profileEmail: {},
  infoSection: {},
  sectionHeader: {},
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { flex: 1 },
  infoValue: { textAlign: "right", flex: 1.5 },
  wrapText: { lineHeight: 18 },
  notAddedText: {},
  divider: { height: 1 },
  editBtn: {
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: { marginLeft: 8 },
  inputLabel: {},
  inputContainer: {
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: { flex: 1 },
  genderOptions: { flexDirection: "row", justifyContent: "space-between" },
  genderBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  genderBtnText: {},
  pickerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 14,
  },
  pickerCardText: {},
  suggestionsBox: { borderWidth: 1, marginTop: 4, overflow: "hidden" },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionItemText: { marginLeft: 10, flex: 1 },
  actionBtnRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelBtn: { borderWidth: 1 },
  cancelBtnText: {},
  saveBtn: {},
  saveBtnText: {},
});
