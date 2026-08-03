import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import Home from "../screens/Home/HomeScreen";

import Name from "../screens/Screenspages/NamePage";
import Gender from "../screens/Screenspages/GenderPage";
import DateOfBirth from "../screens/Screenspages/DateOfBirthPage";
import BirthTime from "../screens/Screenspages/BirthTimePage";
import PlaceOfBirth from "../screens/Screenspages/BirthPlacePage";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import HoroscopeScreen from "../screens/Horoscope/HoroscopeScreen";

import KundliScreen from "../screens/Kundli/KundliScreen";
import KundliMatchingScreen from "../screens/Kundli/KundliMatchingScreen";
import PanchangScreen from "../screens/Panchang/PanchangScreen";
import MuhuratScreen from "../screens/Muhurat/MuhuratScreen";
import NumerologyScreen from "../screens/Numerology/NumerologyScreen";

import NotificationSettingsScreen from "../screens/Notifications/NotificationSettingsScreen";
import AIChatScreen from "../screens/AI/AIChatScreen";
import SubscriptionScreen from "../screens/Premium/SubscriptionScreen";
import HistoryScreen from "../screens/History/HistoryScreen";

import AstroSignup from "../screens/AstrologerScreen/AstroSignup";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { token, user, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {token ? (
                user?.profileCompleted ? (
                   <>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Horoscope" component={HoroscopeScreen} />
    <Stack.Screen name="Kundli" component={KundliScreen} />
    <Stack.Screen name="KundliMatching" component={KundliMatchingScreen} />
    <Stack.Screen name="Panchang" component={PanchangScreen} />
    <Stack.Screen name="Muhurat" component={MuhuratScreen} />
    <Stack.Screen name="Numerology" component={NumerologyScreen} />
    <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
    />
    <Stack.Screen name="AIChat" component={AIChatScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
    <Stack.Screen name="AstroSignup" component={AstroSignup} />
</>
                ) : (
                   <>
    <Stack.Screen name="Name" component={Name} />
    <Stack.Screen name="Gender" component={Gender} />
    <Stack.Screen name="DateOfBirth" component={DateOfBirth} />
    <Stack.Screen name="BirthTime" component={BirthTime} />
    <Stack.Screen name="BirthPlace" component={PlaceOfBirth} />

    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Horoscope" component={HoroscopeScreen} />
    <Stack.Screen name="Kundli" component={KundliScreen} />
    <Stack.Screen name="KundliMatching" component={KundliMatchingScreen} />
    <Stack.Screen name="Panchang" component={PanchangScreen} />
    <Stack.Screen name="Muhurat" component={MuhuratScreen} />
    <Stack.Screen name="Numerology" component={NumerologyScreen} />
    <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
    />
    <Stack.Screen name="AIChat" component={AIChatScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
    <Stack.Screen name="AstroSignup" component={AstroSignup} />
</>
                )
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}
