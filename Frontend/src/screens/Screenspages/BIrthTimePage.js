import React,{useState,useContext} from "react";
import{
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    
} from "react-native";
 import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnboardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker"

export default function BirthTimePage(){
    const nagivation=useNavigation();

    const { user, updateUser } = useContext(AuthContext);
      const { colors, borderRadius, shadows } = useContext(ThemeContext);


    const [BirthTime, setBirthTime] = useState(user?.BirthTime || "");
      const [loading, setLoading] = useState(false);
      const [isFocused, setIsFocused] = useState(false);

      const handleContinue = async() =>{
        if(!BirthTime) return;

        try{
            setLoading(true);
            const response=await api.put("/updateprofile",{BirthTime})


             if(response.data.success){
                            await updateUser(response.data.user)
                            navigation.navigate("Home");
                        }
                        else{
                            Alert.alert("Error", response.data.message|| "Failed to update profile"); 
                        }
        }
        catch(error){
            console.log("BirthTimePage Error: ",error)
            Alert.alert(
                "Connection Error",
                error.response?.data?.message || "Failed to connect to the server" 
            );
        }
        finally{
            setLoading(false)
        }
      };
      const handleBack = () =>{
        navigation.goBack()
    };

    const BirthTime
}