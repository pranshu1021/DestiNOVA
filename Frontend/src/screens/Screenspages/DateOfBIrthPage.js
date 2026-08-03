import React, { useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import OnBoardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function DateOfBirthPage() {
    const navigation = useNavigation();
    const { user, updateUser } = useContext(AuthContext);
    const { colors, borderRadius, shadows, typography } = useContext(ThemeContext);
    const [date, setDate] = useState(user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date(2000, 0, 1));
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        // For Android: picker will close itself on confirm/cancel
        if (Platform.OS === "android") {
            setShowPicker(false);
        }
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleContinue = async () => {
        try {
            setLoading(true);
            const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");


            const response = await api.put("/auth/update-profile", {
                 dateOfBirth: `${year}-${month}-${day}`
            });

            if (response.data.success) {
                await updateUser(response.data.user);
                navigation.navigate("BirthTime");
            } else {
                Alert.alert("Error", response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.log("DateOfBirthPage Error", error);
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

    const formatDateString = (d) => {
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <OnBoardingLayout
            onBack={handleBack}
            currentStep={3}
            iconName="calendar"
            title="When were you born?"
            subtitle="Your birth date determines your sun sign and planetary alignments."
            isScrollable={false}
            onContinue={handleContinue}
            continueDisabled={false}
            continueLoading={loading}
        >
            <View style={styles.contentContainer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowPicker(true)}
                    style={[
                        styles.dateCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            borderRadius: borderRadius.lg,
                            ...shadows.soft
                        }
                    ]}
                >
                    <Ionicons name="calendar-outline" size={28} color={colors.primary} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>
                            Selected Date
                        </Text>
                        <Text style={[styles.dateText, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                            {formatDateString(date)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSub} />
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        maximumDate={new Date()}
                        onChange={handleDateChange}
                    />
                )}
            </View>
        </OnBoardingLayout>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 40
    },
    dateCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        height: 80,
        borderWidth: 1.5,
        width: "100%"
    },
    textContainer: {
        flex: 1,
        marginLeft: 16
    },
    label: {
        marginBottom: 2
    },
    dateText: {}
});