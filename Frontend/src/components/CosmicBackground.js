import React,{ useContext} from "react";
import { View, StyleSheet, Dimensions} from "react-native";
import {ThemeContext} from "../context/ThemeContext";
// iss step mei hum dynamically device ki height aur width gain kr rhe hai
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");

export default function CosmicBackground({children}){
    const {isDark, colors} = useContext(ThemeContext) // iss step mei mai theme check kr rhe hai and set kr rhe hai

    const themeStyle = {
        backgroundColor : colors.background,
    }

    return(
        <View style ={[styles.container, themeStyle]}>
           {/* idhar humara static Nebula glow rahega bg mei */}
            <View
            style={[styles.nebula,{
                top: -SCREEN_WIDTH * 0.2 ,
                left: -SCREEN_WIDTH * 0.2,
                width: SCREEN_WIDTH * 0.8,
                height: SCREEN_WIDTH * 0.8,
                borderRadius: SCREEN_WIDTH * 0.4,
                backgroundColor: isDark? "rgb(115, 28, 126,0.8)" : "rgba(221, 214, 254, 0.28)"
            }

            ]}
            />
            <View
            style= {[styles.nebula,{
                top:SCREEN_HEIGHT * 0.45,
                left: SCREEN_WIDTH * 0.35,
                width: SCREEN_WIDTH * 0.95,
                height: SCREEN_WIDTH * 0.95,
                borderRadius: SCREEN_WIDTH * 0.475,
                                backgroundColor: isDark? "rgb(139,92,246,0.04)" : "rgba(238, 230, 255, 0.32)"

            }]}
            />
            {children}
            </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    nebula:{
        position:"absolute",
        opacity:0.8
    },
})

