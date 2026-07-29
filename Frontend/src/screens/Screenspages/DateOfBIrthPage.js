import React,{useState,useContext} from "react";
import {View,StyleSheet,TouchableOpacity,Text,Alert} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnboardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "@react-navigation/native";

export default function BirthTimePage(){
    const navigation=useNavigation();
    const {user,updateUser}=useContext(AuthContext);
    const {colors,borderRadius,shadows}=useContext(ThemeContext);
    const [datebirth,SetDateBirth]=useState(user?.datebirth || "");
    const [loading,setLoading]=useState(false);

    const handleContinue=async()=>{
        
        if(!datebirth) return;
        try{
            setLoading(true);
            const response=await api.post("/update-profile",{datebirth});
            if(response.data.success){
                await updateUser(response.data.user);
                navigation.navigate("Home");
            }
            else{
                Alert.alert("Error",response.data.message || "Failed to update profile.");
            }
        }

        catch(error){
            console.log("DatebirthPage Error:",error);
            Alert.alert(
                "Coneection Error",
                error.response?.data?.message || "Failed to connect to the server"
            );
        }
        finally{
            setLoading(false);
        }

    };
    const datebirth=[
       
    ]



   return (
  <OnboardingLayout
  onBack={handleBack}
  currentStep={3}
  iconName="Date"
  title="Enter your date of birth"
  subtitle="This helps us personalize your astrology profile"
  isScrollable={false}
  onContinue={handleContinue}
  continueDisabled={!datebirth}
  continueLoading={loading}
  >
    <View></View>

  </OnboardingLayout>
   ) 
}