import React, { useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../../services/api"
export default function LoginScreen(){
    const navigation = useNavigation();
// states idhar rahengi
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

 
    const handleLogin = async()=>{
        if(!email || !password){
            Alert.alert(
                "Error",
                "Please fill all fields"
            );
            return;
        }
        try{
            const response=await api.post("/login",{email,password})
            Alert.alert(
                "Success",
                response.data.message
            )
            console.log(response.data.user)
            console.log(response.data.token)
        }
        catch(error){
            if (error.response){
                Alert.alert(
                    "Login Failed.",
                 error.response.data.message
                )
            }
            else{
                Alert.alert(
                    "Network Error.",
                    "Could not connect to network.."
                )
            }
        }
    }

    return(
        <SafeAreaView>
            <ScrollView>

            <View>
                <Text>
                    👾
                </Text>

                <Text> DestiNOVA</Text>
            </View>
            <Text>Continue your spiritual journey with us.</Text>

            <TextInput
             placeholder="Enter your Email"
             keyboardType="email-address"
             autoCapitalize="none"
             value={email}
             onChangeText = {setEmail}
            />
            <View>
            <TextInput
            placeholder="Enter your Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            />

            <TouchableOpacity onPress={()=>setShowPassword(!showPassword)}>
                <Text>
                    {showPassword ? "🙈" : "🙉"}
                </Text>
            </TouchableOpacity>
            </View>

            {/* forgot password */}

        <TouchableOpacity>
            <Text>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin}>
            <Text>Login</Text>
        </TouchableOpacity>

        <View>
            <Text>Don't have an account?</Text>
            <TouchableOpacity onPress={()=> navigation.navigate("Signup")}>
                <Text>
                    Sign Up
                </Text>
            </TouchableOpacity>
        </View>
            </ScrollView>
        </SafeAreaView>
    )
}