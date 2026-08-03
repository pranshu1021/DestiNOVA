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

export default function BirthTimePage() {
    const navigation = useNavigation();
    const { user, updateUser } = useContext(AuthContext);
    const { colors, borderRadius, shadows, typography } = useContext(ThemeContext);

    // Initial birth time or default to 12:00 PM
    const parseInitialTime = () => {
        if (user?.birthTime) {
            const timeParts = user.birthTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
            if (timeParts) {
                let hours = parseInt(timeParts[1], 10);
                const minutes = parseInt(timeParts[2], 10);
                const ampm = timeParts[3].toUpperCase();
                if (ampm === "PM" && hours < 12) hours += 12;
                if (ampm === "AM" && hours === 12) hours = 0;
                const d = new Date();
                d.setHours(hours, minutes, 0, 0);
                return d;
            }
        }
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        return d;
    };

    const [time, setTime] = useState(parseInitialTime());
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleTimeChange = (event, selectedTime) => {
        if (Platform.OS === "android") {
            setShowPicker(false);
        }
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const formatTimeString = (t) => {
        return t.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const handleContinue = async () => {
        const timeStr = formatTimeString(time);
        try {
            setLoading(true);
            const response = await api.put("/auth/update-profile", {
                birthTime: timeStr
            });

            if (response.data.success) {
                await updateUser(response.data.user);
                navigation.navigate("BirthPlace");
            } else {
                Alert.alert("Error", response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.log("BirthTimePage Error", error);
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
            currentStep={4}
            iconName="time"
            title="What time were you born?"
            subtitle="The exact birth time is essential for accurate house cusps and ascendant calculation."
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
                        styles.timeCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            borderRadius: borderRadius.lg,
                            ...shadows.soft
                        }
                    ]}
                >
                    <Ionicons name="time-outline" size={28} color={colors.primary} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.label, { color: colors.textSub, fontSize: typography.sizes.small }]}>
                            Birth Time
                        </Text>
                        <Text style={[styles.timeText, { color: colors.textMain, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                            {formatTimeString(time)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSub} />
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        is24Hour={false}
                        onChange={handleTimeChange}
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
    timeCard: {
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
    timeText: {}
});