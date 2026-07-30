import React,{useState,useContext} from "react";
import{
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    Alert
    
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OnboardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";


export default function BirthTimePage(){
    const navigation=useNavigation();

    const { user, updateUser } = useContext(AuthContext);
      const { colors, borderRadius, shadows } = useContext(ThemeContext);

    const initialTime = (()=>{
        if(user?.BirthTime){
            // parse "HH:MM Am/PM"
            try{

                const [time,modifier] = user.birthTime.split(" ");
                let [hours, minutes] = time.split(":");

                hours = parseInt(hours,10) ///string se Int mei convert kr rhe hai
                minutes = parseInt(minutes,10)

                if(modifier === "PM" && hours < 12) hours +=12;
                if(modifier === "AM" && hours === 12) hours +=0;
                    //constructor
                const d = new Date();
                d.setHours(hours,minutes,0,0);
                return d;
            }
            catch(e){
                return new Date();
            }
        }
        return new Date();
    })();
  
    const [birthTime, setBirthTime] = useState(initialTime);
    const [showPicker,setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChangeTime = (event,selectedTime)=>{
        setShowPicker(false);
        if(selectedTime){
            setBirthTime(selectedTime);
        }
    };

    const formatTime = (date)=>{
        return date.toLocaleTimeString("en-US",{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,

        })
    }

      const handleContinue = async() =>{
        

        try{
            setLoading(true);
            const timeStr = formatTime(birthTime)
            const response=await api.put("/update-profile",{
                birthTime: timeStr,
            });


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
    const handleSkip = ()=>{
        navigation.navigate("Home");
    }

    return (
        <OnboardingLayout
        onBack = {handleBack}
        currentStep={4}
        iconName ="time"
        title="What time were you born?"
        subtitle="Your birth time will help us calculate
        your birth chart with greater accuracy."
        isScrollable={false}
        onContinue={handleContinue}
        continueLoading ={loading}
        onSkip={handleSkip}
        >
            <View style = {styles.contentContainer}>
                <TouchableOpacity
                activeOpacity={0.8}
                style={[
                    styles.timeCard,
                    {
                        backgroundColor:colors.card,
                        borderColor:colors.border,
                        borderRadius:borderRadius.xl,
                        ...shadows.soft,

                    }
                ]}
                onPress={()=>setShowPicker(true)}
                disabled={loading}
                >
                    <Text style ={[styles.timeLabel, {color:colors.textSub}]}>
                        Selected Birth Time
                    </Text>
                    <Text style ={[styles.timeText, {color:colors.primary}]}>
                        {formatTime(birthTime)}
                    </Text>
                    <View style = {styles.editRow}>
                        <Ionicons name = "time-outline" size={24} color = {colors.primary}/>
                        <Text style = {[styles.editText, {colors:colors.primary}]}>
                            Change Time
                        </Text>
                    </View>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker 
                    value = {birthTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeTime}
                    />
                )}

            </View>

        </OnboardingLayout>
    )
}
const styles = StyleSheet.create({
    contentContainer:{
        marginVertical: 10,
        width: "100%",
        alignItems:"center",

    }
    ,
    timeCard:{
        width: "100%",
        paddingVertical:24,
        paddingHorizontal:20,
        alignItems:"center",
        borderWidth: 1.5,

    },
    timeLabel: {
        fontSize:13,
        fontWeight:"600",
        marginBottom:8,
        textTransform:"uppercase",
        letterSpacing:0.5,
    },
    timeText:{
        fontSize: 32,
        fontWeight:"800",
        marginVertical:8,
    },
    editRow:
    {
        flexDirection:"row",
        alignItems:"center",
        alignTop: 8,

    },
    editText:{
        fontWeight:"600",
        fontSize:14,
        marginLeft:6,
    }
})