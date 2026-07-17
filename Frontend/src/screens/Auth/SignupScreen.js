import React, {useState} from "react";

import api from "../../services/api"

import {
    View, 
    Pressable,
    Text, 
    TextInput,

    ScrollView,
    Alert,
    StyleSheet
    ,TouchableOpacity,

} from "react-native";

import { useNavigation } from "@react-navigation/native";
import {SafeAreaView} from "react-native-safe-area-context";
export default function SignupScreen(){
    
    const [fullName, setFullName] = useState("");
    const [email,setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
 const navigation = useNavigation();
    const handleSignup = async () => {
        if ( !fullName || !email || !phone || !password || !confirmPassword){

             Alert.alert("fill the form correctly.");
            return;
        }
        if ( password !== confirmPassword){
            Alert.alert("Error, Password does not match.")
        }
        Alert.alert("Success, data sent over to our database. (signed-in");
        
        try{
            const response = await api.post("/signup",{
                fullName,
                email,
                phone,
                password,
            });

            Alert.alert("Success", response.data.message)

            // clear karenge idhar form ko
            setFullName("");
            setEmail("");
            setPhone("");
            setPassword("");
            setConfirmPassword("");

        }
        catch(error){
            if(error.response){
                Alert.alert(
                    "Signup Failed",
                    error.response.data.message
                );
            }

            else{
                Alert.alert(
                    "Network Error",
                    "Could not connect to backend"
                );
            }
        }
        
    }
    
    
    return ( 
        <SafeAreaView style = {styles.container}>
            <ScrollView contentContainerStyle= {styles.scroll}
            showsVerticalScrollIndicator={false}>
                <Text style={styles.title} > Create Account </Text>
                <Text style={styles.subtitle}> Join DestiNOVA and begin your spiritual journey.</Text>

                <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName}
                />

                <TextInput style={styles.input} placeholder = "Enter email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}
                />

                <TextInput style={styles.input}
                placeholder="Enter Mobile Number"
                keyboardType="phone-pad" 
                value={phone}
                onChangeText={setPhone}/>

                <TextInput style={styles.input} placeholder="Enter Password" 
                value={password}
                onChangeText= {setPassword}
                secureTextEntry/>
                
                <TextInput style={styles.input} placeholder="Confirm Password" 
                value={confirmPassword}
                onChangeText= {setConfirmPassword}
                secureTextEntry/>

        <TouchableOpacity style= {styles.signupButton} onPress={handleSignup}>
<Text style={styles.signupText}> Create Account</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
            <Text>
                Already have an account?
                </Text> 
                <TouchableOpacity onPress={()=> {console.log("Login button is pressed")
                    navigation.navigate("Login")
                    }}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: "#dbe2f5"
    },
    scroll:{
        flexGrow: 1, 
        justifyContent: "center",
        padding: 24,

    },

    title:{
        fontSize: 32,
        fontWeight: "700"
        ,textAlign: "center",
        color : "indigo",
        marginBottom: 10, 
    },
    subtitle: {
        textAlign: "center",
        color: "slategray",
        marginBottom : 35,
        fontSize: 15,
        lineHeight: 22,

    }
,
    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "lavender",
        borderRadius: 12,
        padding: 15, 
        marginBottom: 18, 
        fontSize: 16, 
        color : "midnightblue",
    }
    ,
    signupButton:{
        backgroundColor: "blueviolet",
        padding:16,
        borderRadius:12, 
        alignItems: "center",
        marginTop : 10, 
        elevation: 4,

    },
    signupText: {
        color: "white",
        fontWeight: "600",
        fontSize: 17,
    }
    ,
    footer: {
        flexDirection: "row",
        justifyContent:"center",
        marginTop: 30,
    }
    ,
    loginText:{
        color: "violet",
        fontWeight: "700"
    }

})