import React, { useState, useContext, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnBoardingLayout from "../../components/OnboardingLayout";
import { searchPlaces } from "../../services/locationIQ";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function BirthPlacePage() {
    const navigation = useNavigation();
    const { user, updateUser } = useContext(AuthContext);
    const { colors, borderRadius, shadows, typography, spacing } = useContext(ThemeContext);

    const [query, setQuery] = useState(user?.birthPlace || "");
    const [latitude, setLatitude] = useState(user?.birthLatitude || null);
    const [longitude, setLongitude] = useState(user?.birthLongitude || null);
    
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSelected, setIsSelected] = useState(!!user?.birthPlace);

    const debounceRef = useRef(null);

    const handleTextChange = (text) => {
        setQuery(text);
        setIsSelected(false);

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
            } catch (error) {
                console.log("Autocomplete suggestion error:", error);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    const handleSelectSuggestion = (item) => {
        setQuery(item.display_name);
        setLatitude(parseFloat(item.lat));
        setLongitude(parseFloat(item.lon));
        setSuggestions([]);
        setIsSelected(true);
        Keyboard.dismiss();
    };

    const handleContinue = async () => {
        if (!query.trim() || latitude === null || longitude === null) {
            Alert.alert("Input Required", "Please select a valid place from the suggestions.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.put("/auth/update-profile", {
                birthPlace: query.trim(),
                birthLatitude: latitude,
                birthLongitude: longitude,
                profileCompleted: true
            });

            if (response.data.success) {
                await updateUser(response.data.user);
                Alert.alert("Welcome!", "Your profile is complete.");
                navigation.navigate("Home");
            } else {
                Alert.alert("Error", response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.log("BirthPlacePage Error", error);
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
        <OnBoardingLayout
            onBack={handleBack}
            currentStep={5}
            iconName="map"
            title="Where were you born?"
            subtitle="Latitude and longitude calculations are critical for generating your exact charts."
            isScrollable={true}
            onContinue={handleContinue}
            continueDisabled={!isSelected}
            continueLoading={loading}
        >
            <View style={styles.contentContainer}>
                <View style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.card,
                        borderColor: isSelected ? colors.success : colors.border,
                        borderRadius: borderRadius.md,
                        ...shadows.soft
                    }
                ]}>
                    <Ionicons name="location-outline" size={20} color={colors.textSub} />
                    <TextInput
                        style={[styles.input, { color: colors.textMain }]}
                        placeholder="Search birthplace city..."
                        placeholderTextColor={colors.textSub}
                        value={query}
                        onChangeText={handleTextChange}
                        autoCorrect={false}
                    />
                    {searching && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {suggestions.length > 0 && (
                    <View style={[
                        styles.suggestionsBox,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            borderRadius: borderRadius.md,
                            ...shadows.soft
                        }
                    ]}>
                        <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollSuggestions}>
                            {suggestions.map((item) => (
                                <TouchableOpacity
                                    key={item.place_id}
                                    style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                                    onPress={() => handleSelectSuggestion(item)}
                                >
                                    <Ionicons name="pin" size={16} color={colors.primary} style={styles.pinIcon} />
                                    <Text numberOfLines={2} style={[styles.suggestionText, { color: colors.textMain, fontSize: typography.sizes.body }]}>
                                        {item.display_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </OnBoardingLayout>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        width: "100%",
        marginVertical: 20
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        borderWidth: 1.5,
        height: 56,
        width: "100%"
    },
    input: {
        flex: 1,
        height: 56,
        paddingHorizontal: 12,
        fontSize: 16
    },
    suggestionsBox: {
        borderWidth: 1.5,
        marginTop: 6,
        maxHeight: 250,
        width: "100%",
        overflow: "hidden"
    },
    scrollSuggestions: {
        width: "100%"
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1
    },
    pinIcon: {
        marginRight: 10
    },
    suggestionText: {
        flex: 1
    }
});
