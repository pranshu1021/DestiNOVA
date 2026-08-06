import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "../../services/api";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

export default function AstroSignup() {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [experienceYears, setExperienceYears] = useState("");
  const [about, setAbout] = useState("");

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [expertise, setExpertise] = useState([]);

  const [chatPricePerMinute, setChatPricePerMinute] = useState("15");
  const [callPricePerMinute, setCallPricePerMinute] = useState("20");

  const [loading, setLoading] = useState(false);

  const pickProfilePhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow gallery permission."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0]);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingBottom: 60,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HERO ================= */}

      <View style={styles.heroContainer}>

        <View
          style={[
            styles.heroIcon,
            {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <Ionicons
            name="sparkles"
            size={42}
            color={colors.primary}
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.textMain,
            },
          ]}
        >
          Become A
        </Text>

        <Text
          style={[
            styles.title,
            {
              color: colors.primary,
            },
          ]}
        >
          Verified Astrologer
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSub,
            },
          ]}
        >
          Join DestiNOVA and start earning through
          Chat & Voice Calls.
        </Text>

      </View>

      {/* ================= PROFILE PHOTO ================= */}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={pickProfilePhoto}
        style={styles.profileContainer}
      >
        {profilePhoto ? (
          <Image
            source={{
              uri: profilePhoto.uri,
            }}
            style={styles.profileImage}
          />
        ) : (
          <View
            style={[
              styles.profilePlaceholder,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <Ionicons
              name="camera"
              size={34}
              color={colors.primary}
            />
          </View>
        )}

        <Text
          style={{
            color: colors.primary,
            marginTop: 12,
            fontWeight: "700",
          }}
        >
          Upload Profile Photo
        </Text>

      </TouchableOpacity>

      {/* ================= PERSONAL INFO ================= */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >

        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.textMain,
            },
          ]}
        >
          Personal Information
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="person"
            size={20}
            color={colors.primary}
          />

          <Text
            style={[
              styles.value,
              {
                color: colors.textMain,
              },
            ]}
          >
            {user?.fullName}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons
            name="mail"
            size={20}
            color={colors.primary}
          />

          <Text
            style={[
              styles.value,
              {
                color: colors.textMain,
              },
            ]}
          >
            {user?.email}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons
            name="call"
            size={20}
            color={colors.primary}
          />

          <Text
            style={[
              styles.value,
              {
                color: colors.textMain,
              },
            ]}
          >
            {user?.phone}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons
            name="location"
            size={20}
            color={colors.primary}
          />

          <Text
            style={[
              styles.value,
              {
                color: colors.textMain,
              },
            ]}
          >
            {user?.birthPlace}
          </Text>
        </View>

      </View>

      {/* ================= EXPERIENCE ================= */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >

        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.textMain,
            },
          ]}
        >
          Professional Details
        </Text>

        <Text
          style={{
            color: colors.textSub,
            marginBottom: 10,
          }}
        >
          Experience (Years)
        </Text>

        <TextInput
          value={experienceYears}
          onChangeText={setExperienceYears}
          keyboardType="numeric"
          placeholder="Example : 5"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.textMain,
            },
          ]}
        />

        <Text
          style={{
            color: colors.textSub,
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          About Yourself
        </Text>

        <TextInput
          multiline
          value={about}
          onChangeText={setAbout}
          placeholder="Tell users about yourself..."
          placeholderTextColor={colors.textMuted}
          style={[
            styles.aboutInput,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.textMain,
            },
          ]}
        />
                {/* ================= LANGUAGES ================= */}

        <Text
          style={{
            color: colors.textSub,
            marginTop: 25,
            marginBottom: 12,
          }}
        >
          Languages Known
        </Text>

        <View style={styles.chipsContainer}>
          {[
            "Hindi",
            "English",
            "Punjabi",
            "Gujarati",
            "Marathi",
            "Tamil",
            "Telugu",
            "Bengali",
          ].map((language) => {
            const selected = languages.includes(language);

            return (
              <TouchableOpacity
                key={language}
                activeOpacity={0.8}
                onPress={() => {
                  if (selected) {
                    setLanguages(
                      languages.filter((item) => item !== language)
                    );
                  } else {
                    setLanguages([...languages, language]);
                  }
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : colors.background,
                    borderColor: selected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selected
                      ? "#fff"
                      : colors.textMain,
                    fontWeight: "600",
                  }}
                >
                  {language}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ================= SKILLS ================= */}

        <Text
          style={{
            color: colors.textSub,
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          Astrology Skills
        </Text>

        <View style={styles.chipsContainer}>
          {[
            "Vedic",
            "Tarot",
            "Numerology",
            "Palmistry",
            "KP",
            "Vastu",
            "Lal Kitab",
            "Face Reading",
          ].map((skill) => {
            const selected = skills.includes(skill);

            return (
              <TouchableOpacity
                key={skill}
                activeOpacity={0.8}
                onPress={() => {
                  if (selected) {
                    setSkills(
                      skills.filter((item) => item !== skill)
                    );
                  } else {
                    setSkills([...skills, skill]);
                  }
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : colors.background,
                    borderColor: selected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selected
                      ? "#fff"
                      : colors.textMain,
                    fontWeight: "600",
                  }}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ================= EXPERTISE ================= */}

        <Text
          style={{
            color: colors.textSub,
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          Expertise
        </Text>

        <View style={styles.chipsContainer}>
          {[
            "Love",
            "Career",
            "Marriage",
            "Finance",
            "Health",
            "Business",
            "Education",
            "Family",
            "Legal",
            "Property",
          ].map((item) => {
            const selected = expertise.includes(item);

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => {
                  if (selected) {
                    setExpertise(
                      expertise.filter((i) => i !== item)
                    );
                  } else {
                    setExpertise([...expertise, item]);
                  }
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : colors.background,
                    borderColor: selected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selected
                      ? "#fff"
                      : colors.textMain,
                    fontWeight: "600",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
            {/* ================= PRICING ================= */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.textMain,
            },
          ]}
        >
          Pricing
        </Text>

        {/* Chat Price */}

        <View style={styles.priceRow}>

          <View>
            <Text style={{ color: colors.textMain, fontWeight: "700" }}>
              Chat Price
            </Text>

            <Text style={{ color: colors.textSub }}>
              ₹ {chatPricePerMinute} / Minute
            </Text>
          </View>

          <View style={styles.counterContainer}>

            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() =>
                setChatPricePerMinute(
                  String(Math.max(5, Number(chatPricePerMinute) - 5))
                )
              }
            >
              <Ionicons
                name="remove"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                setChatPricePerMinute(
                  String(Number(chatPricePerMinute) + 5)
                )
              }
            >
              <Ionicons
                name="add"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

          </View>

        </View>

        {/* Call Price */}

        <View
          style={[
            styles.priceRow,
            {
              marginTop: 25,
            },
          ]}
        >

          <View>

            <Text
              style={{
                color: colors.textMain,
                fontWeight: "700",
              }}
            >
              Call Price
            </Text>

            <Text
              style={{
                color: colors.textSub,
              }}
            >
              ₹ {callPricePerMinute} / Minute
            </Text>

          </View>

          <View style={styles.counterContainer}>

            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() =>
                setCallPricePerMinute(
                  String(Math.max(5, Number(callPricePerMinute) - 5))
                )
              }
            >
              <Ionicons
                name="remove"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                setCallPricePerMinute(
                  String(Number(callPricePerMinute) + 5)
                )
              }
            >
              <Ionicons
                name="add"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

          </View>

        </View>

      </View>

      {/* ================= CERTIFICATES ================= */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >

        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.textMain,
            },
          ]}
        >
          Verification
        </Text>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="document-attach"
            size={28}
            color={colors.primary}
          />

          <Text
            style={{
              color: colors.textMain,
              marginTop: 8,
              fontWeight: "600",
            }}
          >
            Upload Certificates
          </Text>

          <Text
            style={{
              color: colors.textSub,
              marginTop: 5,
              fontSize: 12,
            }}
          >
            PDF / JPG / PNG
          </Text>

        </TouchableOpacity>

      </View>

      {/* ================= TERMS ================= */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >

        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.textMain,
            },
          ]}
        >
          Terms & Conditions
        </Text>

        <Text
          style={{
            color: colors.textSub,
            lineHeight: 24,
          }}
        >
          • I confirm all information provided is genuine.

          {"\n\n"}

          • I agree to DestiNOVA's Astrologer Policy.

          {"\n\n"}

          • I understand my application will be reviewed by the Admin Team.

          {"\n\n"}

          • I agree that false information may lead to permanent suspension.
        </Text>

      </View>

      {/* ================= SUBMIT ================= */}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={loading}
        style={[
          styles.submitButton,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={async () => {
          try {
            setLoading(true);

            const response = await api.post(
              "/astrologer/register",
              {
                experienceYears,

                languages,

                skills,

                expertise,

                about,

                chatPricePerMinute,

                callPricePerMinute,

                profilePhoto,
              }
            );

            Alert.alert(
              "Success",
              response.data.message
            );

          } catch (err) {

            Alert.alert(
              "Error",
              err?.response?.data?.message ||
                "Unable to submit application."
            );

          } finally {

            setLoading(false);

          }
        }}
      >

        <Ionicons
          name="sparkles"
          size={22}
          color="#fff"
        />

        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 17,
            marginLeft: 10,
          }}
        >
          {loading
            ? "Submitting..."
            : "Request Approval"}
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  heroContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 35,
    alignItems: "center",
  },

  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 15,
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  profilePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C8A45D",
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#C8A45D",
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 22,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 22,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  value: {
    marginLeft: 14,
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
  },

  aboutInput: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    fontSize: 15,
    textAlignVertical: "top",
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 30,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  counterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 35,
  },
    submitButton: {
    height: 62,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 45,

    borderRadius: 20,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    shadowColor: "#C8A45D",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 14,
  },

  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },

  divider: {
    height: 1,
    opacity: 0.15,
    marginVertical: 20,
  },

  sectionSpacing: {
    marginTop: 25,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    alignSelf: "flex-start",
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 8,
  },

  glass: {
    overflow: "hidden",
  },

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  mt10: {
    marginTop: 10,
  },

  mt15: {
    marginTop: 15,
  },

  mt20: {
    marginTop: 20,
  },

  mt25: {
    marginTop: 25,
  },

  mb10: {
    marginBottom: 10,
  },

  mb20: {
    marginBottom: 20,
  },

  mb30: {
    marginBottom: 30,
  },

  textCenter: {
    textAlign: "center",
  },

  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    justifyContent: "space-between",
  },

  fullWidth: {
    width: "100%",
  },
});