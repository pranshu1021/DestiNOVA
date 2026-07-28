import * as SplashScreenNative from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from "./src/navigation/AppNavigator.js";
import AuthProvider from './src/context/AuthContext.js';
import { ThemeProvider } from "./src/context/ThemeContext.js";
import SplashScreen from "./src/screens/Splash/SplashScreen.js";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "./src/config/googleAuth.js";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

SplashScreenNative.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
    SplashScreenNative.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          {showSplash ? (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          )}
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}





