import * as SplashScreen from "expo-splash-screen"
import {useEffect} from "react";

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from "./src/navigation/AppNavigator.js";
import AuthProvider from './src/context/AuthContext.js';

SplashScreen.preventAutoHideAsync().catch(() => {});
export default function App() {
useEffect(() => {

    async function prepare() {

      try {

        // Future:
        // Load fonts
        // Load images
        // Check AsyncStorage
        // Fetch initial data

        await new Promise(resolve => setTimeout(resolve, 1500));

      } finally {

        await SplashScreen.hideAsync();

      }

    }

    prepare();

  }, []);
  return (


    <AuthProvider>
    <NavigationContainer>
         <AppNavigator/>
</NavigationContainer>
</AuthProvider>
  );
}





