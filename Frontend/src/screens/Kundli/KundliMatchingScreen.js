import React, { useContext, useState, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import CosmicBackground from "../../components/CosmicBackground";
import { searchPlaces } from "../../services/locationIQ";
import api from "../../services/api";

const renderSafeText = (val, fallback = "") => {
    if (!val) return fallback;
    if (typeof val === "string" || typeof val === "number") return String(val);
    if (typeof val === "object") return val.name || val.description || val.type || "";
    return fallback;
};

export default function KundliMatchingScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

    // Form inputs for partner
    const [partnerName, setPartnerName] = useState("");
    const [partnerDob, setPartnerDob] = useState(new Date(2000, 0, 1));
    const [partnerTime, setPartnerTime] = useState(new Date());
    const [partnerPlace, setPartnerPlace] = useState("");
    const [partnerLat, setPartnerLat] = useState(null);
    const [partnerLon, setPartnerLon] = useState(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [searching, setSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [placeSelected, setPlaceSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const debounceRef = useRef(null);

    // Format times for display
    const formatTime = (t) => {
        return t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const formatDate = (d) => {
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    };

    const handlePlaceSearch = (text) => {
        setPartnerPlace(text);
        setPlaceSelected(false);
        if (text.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchPlaces(text);
                setSuggestions(results);
            } catch (err) {
                console.log(err);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    const handleSelectSuggestion = (item) => {
        setPartnerPlace(item.display_name);
        setPartnerLat(parseFloat(item.lat));
        setPartnerLon(parseFloat(item.lon));
        setSuggestions([]);
        setPlaceSelected(true);
        Keyboard.dismiss();
    };

    const handleCalculate = async () => {
        if (!partnerName.trim() || !placeSelected) {
            Alert.alert("Input Required", "Please enter partner's name and select a valid birthplace suggestion.");
            return;
        }

        // Validate user's details exist
        if (!user?.dateOfBirth || !user?.birthTime || user?.birthLatitude === null || user?.birthLongitude === null) {
            Alert.alert("Profile Incomplete", "Please complete your birth profile details first before matching.");
            return;
        }

        // Format dates & times
        const userDetails = {
            dob: user.dateOfBirth,
            time: user.birthTime,
            lat: user.birthLatitude,
            lon: user.birthLongitude
        };

        const partnerDetails = {
            dob: partnerDob.toISOString(),
            time: formatTime(partnerTime),
            lat: partnerLat,
            lon: partnerLon
        };

        // Enforce Boy details vs Girl details roles. If user is Male: Boy=User, Girl=Partner.
        // If user is Female: Boy=Partner, Girl=User. If other: Boy=User, Girl=Partner.
        const userIsGirl = user.gender?.toLowerCase() === "female";
        const boy = userIsGirl ? partnerDetails : userDetails;
        const girl = userIsGirl ? userDetails : partnerDetails;

        try {
            setLoading(true);
            setResult(null);
            const response = await api.post("/matching", { boy, girl });
            console.log(JSON.stringify(response.data.data, null, 2));
            setResult(response.data.data);
        } catch (error) {
            console.log(error);
            Alert.alert("Matching Failed", getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <CosmicBackground>
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                {/* Header */}
                <View style={[styles.header, { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md }]}>
                    <TouchableOpacity accessibilityLabel="Go back" style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color={colors.textMain} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: colors.textMain, fontSize: typography.sizes.h2, fontWeight: typography.weights.bold }]}>Kundli Matching</Text>
                        <Text style={[styles.subtitle, { color: colors.textSub, fontSize: typography.sizes.small }]}>Marriage compatibility checker</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { padding: spacing.xxl }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {result ? (
                        // Results Section
                        <View style={styles.resultsContainer}>
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft, alignItems: "center" }]}>
                                <Text style={[styles.scoreTitle, { color: colors.textSub, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                                    COMPATIBILITY SCORE
                                </Text>
                                <Text style={[styles.scoreValue, { color: colors.primary, fontSize: 44, fontWeight: "900", marginVertical: 10 }]}>
                                    {result.guna_milan?.total_points ?? result.score ?? "0"} / {result.guna_milan?.maximum_points ?? result.maxScore ?? "36"}
                                </Text>
                                <Text style={[styles.interpretationText, { color: colors.textMain, fontSize: typography.sizes.body, textAlign: "center", lineHeight: 22 }]}>
                                    {renderSafeText(result.message?.description) || renderSafeText(result.message?.type) || "Compatibility analysis completed."}
                                </Text>
                            </View>

                            {/* Ashta Kuta Parameters */}
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.xl, ...shadows.soft, marginTop: 20 }]}>
                                <Text style={[styles.cardTitle, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: 15 }]}>
                                    📊 Ashta Kuta Details
                                </Text>
                                
                                {(result.guna_milan?.guna || result.guna || []).map((kuta, idx) => {
                                    const kutaNameStr = renderSafeText(kuta.name) || renderSafeText(kuta.kuta) || `Kuta ${idx + 1}`;
                                    const kutaDescStr = renderSafeText(kuta.description) || `Compatibility test for ${kutaNameStr}`;
                                    return (
                                        <View key={idx} style={[styles.kutaRow, { borderBottomColor: colors.border }]}>
                                            <View style={styles.kutaNameBox}>
                                                <Text style={[styles.kutaName, { color: colors.textMain, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
                                                    {kutaNameStr}
                                                </Text>
                                                <Text style={[styles.kutaDesc, { color: colors.textSub, fontSize: typography.sizes.caption }]}>
                                                    {kutaDescStr}
                                                </Text>
                                            </View>
                                            <Text style={[styles.kutaPoints, { color: colors.primary, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                                                {kuta.obtained_points ?? kuta.received_points ?? 0} / {kuta.maximum_points ?? kuta.max_points ?? 0}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            <TouchableOpacity
                                style={[styles.calculateBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md, marginTop: 20 }]}
                                onPress={() => setResult(null)}
                            >
                                <Text style={{ color: colors.white, fontWeight: typography.weights.bold, fontSize: 16 }}>Test Another Match</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Form Input Section
                        <View style={styles.formContainer}>
                            <Text style={[styles.formTitle, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold, marginBottom: 15 }]}>
                                Enter Partner's Details
                            </Text>

                            <Text style={[styles.inputLabel, { color: colors.textMain }]}>Partner's Name</Text>
                            <TextInput
                                style={[styles.textInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
                                placeholder="Enter name"
                                placeholderTextColor={colors.textSub}
                                value={partnerName}
                                onChangeText={setPartnerName}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textMain }]}>Date of Birth</Text>
                            <TouchableOpacity
                                style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={{ color: colors.textMain }}>{formatDate(partnerDob)}</Text>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>

                            <Text style={[styles.inputLabel, { color: colors.textMain }]}>Time of Birth</Text>
                            <TouchableOpacity
                                style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={{ color: colors.textMain }}>{formatTime(partnerTime)}</Text>
                                <Ionicons name="time-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>

                            <Text style={[styles.inputLabel, { color: colors.textMain }]}>Birthplace</Text>
                            <View style={[styles.searchWrapper, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}>
                                <TextInput
                                    style={[styles.searchField, { color: colors.textMain }]}
                                    placeholder="Enter birthplace city..."
                                    placeholderTextColor={colors.textSub}
                                    value={partnerPlace}
                                    onChangeText={handlePlaceSearch}
                                />
                                {searching && <ActivityIndicator size="small" color={colors.primary} />}
                            </View>

                            {suggestions.length > 0 && (
                                <View style={[styles.suggestions, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md, ...shadows.soft }]}>
                                    {suggestions.map((item) => (
                                        <TouchableOpacity key={item.place_id} style={[styles.suggestionItem, { borderBottomColor: colors.border }]} onPress={() => handleSelectSuggestion(item)}>
                                            <Text style={{ color: colors.textMain }}>{item.display_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {showDatePicker && (
                                <DateTimePicker
                                    value={partnerDob}
                                    mode="date"
                                    maximumDate={new Date()}
                                    onChange={(e, d) => { setShowDatePicker(false); if (d) setPartnerDob(d); }}
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={partnerTime}
                                    mode="time"
                                    onChange={(e, d) => { setShowTimePicker(false); if (d) setPartnerTime(d); }}
                                />
                            )}

                            <TouchableOpacity
                                style={[styles.calculateBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md, marginTop: 30 }]}
                                onPress={handleCalculate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Text style={{ color: colors.white, fontWeight: typography.weights.bold, fontSize: 16 }}>Calculate Compatibility</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </CosmicBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", gap: 12 },
    backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    title: {},
    subtitle: { marginTop: 2 },
    scrollContent: { flexGrow: 1 },
    resultsContainer: {},
    card: { borderWidth: 1, padding: 20 },
    scoreTitle: { letterSpacing: 1 },
    scoreValue: {},
    interpretationText: {},
    cardTitle: {},
    kutaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
    kutaNameBox: { flex: 1, paddingRight: 10 },
    kutaName: { marginBottom: 2 },
    kutaDesc: {},
    kutaPoints: {},
    formContainer: { gap: 10 },
    formTitle: {},
    inputLabel: { fontSize: 14, fontWeight: "600", marginTop: 10 },
    textInput: { borderWidth: 1, height: 50, paddingHorizontal: 15, fontSize: 16 },
    pickerBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, height: 50, paddingHorizontal: 15 },
    searchWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, height: 50, paddingHorizontal: 15 },
    searchField: { flex: 1, fontSize: 16 },
    suggestions: { borderWidth: 1, marginTop: 4, maxHeight: 200, zIndex: 999 },
    suggestionItem: { padding: 15, borderBottomWidth: 1 },
    calculateBtn: { height: 50, justifyContent: "center", alignItems: "center", width: "100%" }
});
