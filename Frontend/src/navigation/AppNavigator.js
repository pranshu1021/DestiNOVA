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
import AdminPanelScreen from "../screens/Admin/AdminPanelScreen";
import WalletScreen from "../screens/Wallet/WalletScreen";

import AstrologerDashboardScreen from "../screens/AstrologerScreen/AstrologerDashboardScreen";
import AstrologerDetailScreen from "../screens/AstrologerScreen/AstrologerDetailScreen";
import AstrologerListScreen from "../screens/AstrologerScreen/AstrologerListScreen";
import AstrologerSessionScreen from "../screens/AstrologerScreen/AstrologerSessionScreen";
import AstrologerSessionsScreen from "../screens/AstrologerScreen/AstrologerSessionsScreen";
import AstrologerAnalyticsScreen from "../screens/AstrologerScreen/AstrologerAnalyticsScreen";
import AstroSignup from "../screens/AstrologerScreen/AstroSignup";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { token, user, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    const isAstrologer = Boolean(user?.astrologer?.isApproved);

    const initialRouteName = token
        ? isAstrologer
            ? "AstrologerDashboard"
            : user?.profileCompleted
                ? "Home"
                : "Name"
        : "Login";

    return (
        <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{ headerShown: false }}
        >
            {token ? (
                isAstrologer ? (
                    <>
                            <Stack.Screen name="AstrologerDashboard" component={AstrologerDashboardScreen} />
                        <Stack.Screen name="AstrologerSessions" component={AstrologerSessionsScreen} />
                        <Stack.Screen name="AstrologerAnalytics" component={AstrologerAnalyticsScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="AstrologerSession" component={AstrologerSessionScreen} />
                        {user?.isAdmin && <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />}
                    </>
                ) : user?.profileCompleted ? (
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
                        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
                        <Stack.Screen name="Wallet" component={WalletScreen} />
                        <Stack.Screen name="AstrologerList" component={AstrologerListScreen} />
                        <Stack.Screen name="AstrologerDetail" component={AstrologerDetailScreen} />
                        <Stack.Screen name="AstrologerSession" component={AstrologerSessionScreen} />
                        <Stack.Screen name="AstrologerDashboard" component={AstrologerDashboardScreen} />
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
                        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
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
