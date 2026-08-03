import React, { useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnBoardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const GENDER_OPTIONS = [
    { label: "Male", value: "Male", icon: "male-outline" },
    { label: "Female", value: "Female", icon: "female-outline" },
    { label: "Other", value: "Other", icon: "transgender-outline" }
];

export default function GenderPage() {
    const navigation = useNavigation();
    const { user, updateUser } = useContext(AuthContext);
    const { colors, borderRadius, shadows, typography } = useContext(ThemeContext);
    const [gender, setGender] = useState(user?.gender || "");
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!gender) return;

        try {
            setLoading(true);
            const response = await api.put("/auth/update-profile", { gender });

            if (response.data.success) {
                await updateUser(response.data.user);
                navigation.navigate("DateOfBirth");
            } else {
                Alert.alert("Error", response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.log("GenderPage Error", error);
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
            currentStep={2}
            iconName="people"
            title="What's your gender?"
            subtitle="This is used to personalize daily readings and charts."
            isScrollable={false}
            onContinue={handleContinue}
            continueDisabled={!gender}
            continueLoading={loading}
        >
            <View style={styles.optionsContainer}>
                {GENDER_OPTIONS.map((option) => {
                    const isSelected = gender === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            activeOpacity={0.8}
                            onPress={() => setGender(option.value)}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: isSelected ? colors.primaryLight : colors.card,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                    borderRadius: borderRadius.lg,
                                    ...shadows.soft
                                }
                            ]}
                        >
                            <View style={[
                                styles.iconCircle,
                                { backgroundColor: isSelected ? colors.primary : colors.border }
                            ]}>
                                <Ionicons
                                    name={option.icon}
                                    size={24}
                                    color={isSelected ? colors.white : colors.textMain}
                                />
                            </View>
                            <Text style={[
                                styles.label,
                                {
                                    color: colors.textMain,
                                    fontSize: typography.sizes.large,
                                    fontWeight: isSelected ? typography.weights.bold : typography.weights.medium
                                }
                            ]}>
                                {option.label}
                            </Text>
                            {isSelected && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color={colors.primary}
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </OnBoardingLayout>
    );
}

const styles = StyleSheet.create({
    optionsContainer: {
        width: "100%",
        gap: 16,
        marginVertical: 20
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        height: 72,
        borderWidth: 1.5,
        width: "100%"
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16
    },
    label: {
        flex: 1
    },
    checkIcon: {
        marginLeft: "auto"
    }
});
