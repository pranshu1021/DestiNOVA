import React, { createContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkColors, lightColors } from "../Theme/colors";
import { gradients } from "../Theme/gradients";
import { shadows } from "../Theme/shadows";
import { spacing } from "../Theme/spacing";
import { typography } from "../Theme/typography";
import { borderRadius } from "../Theme/borderRadius";
import { animations } from "../Theme/animations";
import { icons } from "../Theme/icons";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState("system");
    const [activeTheme, setActiveTheme] = useState(systemScheme === "dark" ? "dark" : "light");
    
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem("themeMode");
                if (savedMode) {
                    setThemeModeState(savedMode);
                }
            } catch (error) {
                console.log("Error loading theme settings:", error);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        if (themeMode === "system") {
            setActiveTheme(systemScheme === "dark" ? "dark" : "light");
        } else {
            setActiveTheme(themeMode);
        }
    }, [themeMode, systemScheme]);

    const setThemeMode = async (mode) => {
        try {
            await AsyncStorage.setItem("themeMode", mode);
            setThemeModeState(mode);
        } catch (error) {
            console.log("Error saving theme settings:", error);
        }
    };

    const isDark = activeTheme === "dark";
    const themeColors = isDark ? darkColors : lightColors; 

    const value = {
        isDark,
        themeColors,
        themeMode,
        setThemeMode,
        colors: themeColors,
        gradients,
        shadows,
        spacing,
        typography,
        borderRadius,
        animations,
        icons,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
