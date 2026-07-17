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
        <SafeAreaView style={styles.loginContainer}>
            <ScrollView contentContainerStyle={styles.scroll}
               showsVerticalScrollIndicator={false}>

            <View >
                <Text style={styles.loginTitle}>
                    👾
                </Text>

                <Text style={styles.loginSubtitle}> DestiNOVA</Text>
            </View>
            <Text style={styles.LoginContent}>Continue your spiritual journey with us.</Text>

            <TextInput style={styles.loginInput}
             placeholder="Enter your Email"
             keyboardType="email-address"
             autoCapitalize="none"
             value={email}
             onChangeText = {setEmail}
            />
            <View style={styles.passwordContainer}>
            <TextInput style={styles.loginPassword}
            placeholder="Enter your Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            />

            <TouchableOpacity onPress={()=>setShowPassword(!showPassword)}>
                <Text style={styles.showPasswordIcon}>
                    {showPassword ? "🙈" : "🙉"}
                </Text>
            </TouchableOpacity>
            </View>

            {/* forgot password */}

        <TouchableOpacity>
            <Text style={styles.loginText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginButton}>Login</Text>
        </TouchableOpacity>

        <View style={styles.loginAlreadyAccount}>
            <Text style={styles.loginText}>Don't have an account?</Text>
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

const styles=StyleSheet.create({
   loginContainer:{
    flex:1,
    backgroundColor:"#dbe2f5"
   },

   scroll:{
    flexGrow:1,
    justifyContent:"center",
    padding:24,
   },

   loginTitle:{
    fontSize:32,
    fontWeight:"700",
    textAlign:"center",
    color:"indigo",
    marginBottom:10,
   },

   loginSubtitle:{
    textAlign:"center",
    color:"slategray",
    marginBottom:35,
    fontSize:20,
    fontWeight:"bold",
    lineHeight:22,
   },

   LoginContent:{
   fontSize:20,
   textAlign:"center",
   },

    loginInput: {
        marginTop:10,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "lavender",
        borderRadius: 12,
        padding: 15, 
        marginBottom: 18, 
        fontSize: 16, 
        color : "midnightblue",
    },

    loginPassword: {
        flex:1,
        position:"fixed",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "lavender",
        borderRadius: 12,
        padding: 15, 
        marginBottom: 18, 
        fontSize: 16, 
        color : "midnightblue",
    },

      loginButton:{
        backgroundColor: "blueviolet",
        padding:16,
        borderRadius:12, 
        color:"white",
         textAlign:"center",
         fontSize:18,
        alignItems: "center",
        marginTop : 10, 
        elevation: 4,
       
       

    },

      loginText: {
        color: "blue",
        fontWeight: "600",
        fontSize: 17,
        textAlign:"center",
        
    },

    loginAlreadyAccount:{
        marginTop:10,
        flexDirection:"row",
        justifyContent:"space-between",
    },
  
   showPasswordIcon:{
    fontSize:30,
    textAlign:"right",
     marginLeft:10,
   },

   passwordContainer:{
   flexDirection:"row",
   alignItems:"center",
   },

})