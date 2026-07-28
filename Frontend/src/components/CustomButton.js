import React, {useContext, useRef} from "react";
//useRef this is also an react hook used for references 
import {Pressable,Text, StyleSheet, AcivityIndicator, Animated} from "react-native";
import {ThemeContext} from "../context/ThemeContext";

export default function CustomButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    style,
    textStyle,
}){
    const {colors, shadows ,typography, borderRadius} = useContext(ThemeContext);
    // idhar hum standard animated values ko scale karenge according to native feedback
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn =() =>{
        if(!disabled && !loading){
            Animated.spring(scale,{
                toValue: 0.96,
                speed:40,
                bounciness: 4,
                useNativeDriver: true,

            }).start();
        }
    };

    const handlePressOut =()=>{
         Animated.spring(scale,{
                toValue: 1,
                speed:40,
                bounciness: 4,
                useNativeDriver: true,
            }).start();
    }

    return (
        <Animated.View style={[styles.buttonWrapper,
            {
                transform:[{scale}],
            },
            style,
        ]}
        >
        <Pressable
        onPressIn = {handlePressIn}
        onPressOut = {handlePressOut}
        onPress={onPress}
        disabled = {disabled || loading}
        style = {[styles.button,
            {
                backgroundColor:colors.primary,
                borderRadius: borderRadius.lg,
                ...shadows.primaryGlow,
            },
            disabled && {backgroundColor: colors.primaryLight + "BF"},
        ]}
        >

{loading ?(
    <AcivityIndicator size = "small" color= {colors.white}/>
):(
    <Text style= {[
        styles.text,
        {
            fontSize: typography.sizes.large,
            fontWeight: typography.weights.bold,
            color:colors.white,

        },
        textStyle,
    ]}>
        {title}
        {/* yeh title bas naam hai screen ka */}

    </Text>
)}

        </Pressable>

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    buttonWrapper:{
        width:"100%",
    },
    button:{
        height:54,
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        width:"100%",
    },
    text:{
        textAlign:"center"
    },
});