import React, {createContext, useState, useEffect} from "react";
import  {useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {darkColors, lightColors} from "../theme/colors";
import{ gradients} from "../theme/gradients";
import {shadows} from "../theme/shadows";
import { spacing} from "../theme/spacing";
import { typography } from "../theme/typography";
import {borderRadius} from "../theme/borderRadius";
import {animations} from "../theme/borderRadius";
import {icons} from "../theme/icons";

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) =>{
    const systemScheme = useColorScheme(); // yeh bttata hai ki system dark mode mei h ya light
    const [themeMode, setThemeModeState] = useState("system");
    const [activeTheme, setActiveTheme] = useState(systemScheme === "dark" ? "dark" : "light");
    
    // ab idhar load karlete hai jab bhi tumhara phn boot hoye
    useEffect(() => {
        const loadTheme = async () =>{
            try{
                const savedMode = await AsyncStorage.getItem("themeMode");
                if(savedMode){
                    setThemeModeState(savedMode);
                }
            }catch(error){
                console.log("Error loading theme settings:", error);
            }
        };
        loadTheme()
    }, [])
    // update active colors jab bhi thememode ya fir system theme change ho 
    useEffect(()=>{
        if(themeMode==="system"){
            setActiveTheme(systemScheme === "dark" ? "dark" : "light" ); //explain this
        }else{
            setActiveTheme(themeMode)
        }
    },[themeMode, systemScheme])

    const setThemeMode = async(mode) =>{
        try{
            await AsyncStorage.setItem("themeMode", mode);
            setThemeModeState(mode);
        }
        catch(error){
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
        <ThemeContext.Provider value = {value}>
            {children}
        </ThemeContext.Provider>
    )

}