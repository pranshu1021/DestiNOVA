import React,{useState,useContext} from "react";
import {View,StyleSheet,Platform,TouchableOpacity,Text,Alert} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnboardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function DateOfBirthPage(){
    const navigation=useNavigation();
    const {user,updateUser}=useContext(AuthContext);
    const {colors,borderRadius,shadows}=useContext(ThemeContext);

    const initialDate = user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date();
    const [date, setDate] = useState(initialDate);
    const [showPicker,setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChange = (event, selectedDate)=>
    {
        setShowPicker(Platform.OS ==="ios");
        if(selectedDate){
            setDate(selectedDate);
        }
    }

    // idhar format set kr rhe hai => en-IN bas ek format hai for dates
    const formatDate = (value)=>{
        return value.toLocaleDateString("en-IN",{
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    const handleContinue=async()=>{
        
        
        try{
            setLoading(true);
            console.log("DOB:", date.toISOString());
            const response=await api.put("/update-profile",{
                dateOfBirth: date.toISOString(),
            });
            if(response.data.success){
                await updateUser(response.data.user);
                navigation.navigate("Home");
            }
            else{
                Alert.alert("Error",response.data.message || "Failed to update profile.");
            }
        }

        catch(error){
            console.log("DateOfBirthPage Error:",error);
            Alert.alert(
                "Connection Error",
                error.response?.data?.message || "Failed to connect to the server"
            );
        }
        finally{
            setLoading(false);
        }

    };

    const handleSkip = ()=>{
        navigation.navigate("Home")
    };

    const handleBack= ()=>{
        navigation.goBack();
    }



   return (
  <OnboardingLayout
  onBack={handleBack}
  currentStep={3}
  iconName="calendar"
  title="Date of Birth"
  subtitle="Select your birth date to generate accurate astrological insights."
  isScrollable={false}
  onContinue={handleContinue}
  continueLoading={loading}
  onSkip={handleSkip}
  >
    <View style = {styles.contentContainer}>
        <TouchableOpacity
        activeOpacity={0.8}
        style={[
            styles.dateCard,
            {
                backgroundColor: colors.card,
                borderColor: colors.border,
                ...shadows.soft,
                borderRadius:borderRadius.md
            }
        ]}
        onPress={()=>{
                setShowPicker(true)
                
        }}
        disabled= {loading}
        >
            <Ionicons name= "calendar-outline" size={24} color= {colors.primary}/>
            <Text style = {[styles.dateText , {color:colors.textMain}]}> 
                {formatDate(date)}
            </Text>

        </TouchableOpacity>

        {showPicker && (
            <DateTimePicker
            value ={date}
            mode = "date"
            display="default"
            maximumDate = {new Date()}
            onChange={onChange}
            />
        )}
    </View>
  </OnboardingLayout>
   ) 
}

const styles = StyleSheet.create({
    contentContainer: {
        marginVertical:10,
        width:"100%"
    },
    dateCard:{
        flexDirection:"row",
        alignItems:"center",
        height: 60,
        paddingHorizontal:20,
        borderWidth:1.5,
    },
    dateText:{
        marginLeft:15,
        fontSize:16,
        fontWeight: "600",
    }
})