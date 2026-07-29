import React, {useState, useContext} from "react";
import {View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnboardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function GenderPage(){
    const navigation = useNavigation();
    const {user,updateUser} = useContext(AuthContext);
    const { colors ,borderRadius, shadows} = useContext(ThemeContext);

    const [gender,setGender] = useState(user?.gender || "");
    const [loading,setLoading] = useState(false);

    const handleContinue = async () =>{

        if(!gender) return;

        try{
            setLoading(true);
            const response = await api.put("/update-profile",{gender});

            if(response.data.success){
                await updateUser(response.data.user)
                navigation.navigate("DateOfBirth");
            }
            else{
                Alert.alert("Error", response.data.message|| "Failed to update profile"); 
            }


        }
        catch(error){
            console.log("GenderPage Error: ",error)
            Alert.alert(
                "Connection Error",
                error.response?.data?.message || "Failed to connect to the server" 
                // conditional rendering  2 -> ternary operator ==> AppNavigator.js

            );
        }
        finally{
            setLoading(false)
        }
    };

    const handleBack = () =>{
        navigation.goBack()
    };

    const genders= [
        {label:"Female", value:"Female", icon:"female"},
        {label:"Male", value:"Male", icon:"male"},
        {label:"Prefer not to say", value:"Other", icon:"person-outline"}
    ];

    return(

        <OnboardingLayout
            onBack = {handleBack}
            currentStep={2}
            iconName = "people"
            title = "Select your gender"
            subtitle="This helps us personalize your astrology profile"
            isScrollable={false}
            onContinue={handleContinue}
            continueDisabled={!gender}
            continueLoading = {loading}
    
        >
            <View style={styles.cardContainer}>
                {
                    genders.map((item)=>{
                        const isSelected = gender == item.value;
                        return(
                            <TouchableOpacity
                            key = {item.value}
                            activeOpacity={0.8}
                            style={[
                                styles.genderCard,
                                {
                                    backgroundColor:colors.card,
                                borderColor: colors.border,
                            borderRadius: borderRadius.  md,
                        ...shadows.soft, 
                    },
                    isSelected && {
                        borderColor: colors.primary,
                        backgroundColor: colors.primaryLight
                    }
                            ]}
                            onPress={()=>setGender(item.value)}
                            disabled={loading}
                            >   
                            <Ionicons name={item.icon}
                            size = {24}
                            color ={ isSelected ? colors.primary : colors.textSub}
                            />

                            <Text style={
                                [styles.genderText,
                                    {
                                        color:colors.textMain
                                    },
                                    isSelected && {color: colors.primary,
                                        fontWeight:"700"
                                    }
                                ]
                            }>
                                {item.label}
                            </Text>
                                {
                                    isSelected && (
                                        <Ionicons 
                                        name="checkmark-circle"
                                        size ={30}
                                        color={colors.primary}
                                        style={styles.checkIcon}
                                        />
                                    )
                                }
                            </TouchableOpacity>
                        )
                    })
                }

            </View>

        </OnboardingLayout>
    )

} 
const styles = StyleSheet.create({
    cardContainer: {
        marginVertical:10,
        width:"100%"
    },
    genderCard: {
        flexDirection:"row",
        alignItems: "center",
        height:60,
        paddingHorizontal:20,
        marginBottom:12,
        borderWidth: 2,
    },
    genderText: {
        marginLeft:14,
        fontSize: 16,
        fontWeight:"600",
    }
    ,checkIcon:
    {
        marginLeft: "auto"
        }
})
