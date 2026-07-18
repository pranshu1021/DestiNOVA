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
<View style={styles.card}>
            <View >
                <Text style={styles.loginTitle}>
                    👾
                </Text>

                <Text style={styles.loginSubtitle}> DestiNOVA</Text>
            </View>
            <Text style={styles.LoginContent}>Continue your spiritual journey with us.</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.loginInput}
             placeholder="Enter your Email"
             keyboardType="email-address"
             autoCapitalize="none"
             value={email}
             onChangeText = {setEmail}
            />
<Text style={styles.label}>Password</Text>
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

        <TouchableOpacity style={{alignSelf:"flex-end"}}>
            <Text style={styles.loginText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={handleLogin}>
            <Text style={styles.loginButton}>Login</Text>
        </TouchableOpacity>

        <View style={styles.loginAlreadyAccount}>
            <Text style={styles.loginText}>Don't have an account?</Text>
            <TouchableOpacity onPress={()=> navigation.navigate("Signup")}>
                <Text style={styles.signupText}>
                    Sign Up
                </Text>
            </TouchableOpacity>
        </View>
        </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    label: {
  marginBottom: 8,
  marginLeft: 5,
  color: "#374151",
  fontWeight: "600",
},
  loginContainer: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  loginTitle: {
    fontSize: 70,
    textAlign: "center",
    marginBottom: 10,
  },

  loginSubtitle: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    color: "#4F46E5",
    letterSpacing: 1,
  },

  LoginContent: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 17,
    marginTop: 12,
    marginBottom: 35,
    lineHeight: 24,
  },

  loginInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    marginBottom: 18,

    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",
    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    paddingHorizontal: 15,

    marginBottom: 18,

    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  loginPassword: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
  },

  showPasswordIcon: {
    fontSize: 24,
    marginLeft: 10,
  },

  loginText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },

  loginButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 17,
    borderRadius: 18,
    marginTop: 18,

    textAlign: "center",
    color: "white",

    fontSize: 18,
    fontWeight: "700",

    elevation: 5,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  loginAlreadyAccount: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  card: {
  backgroundColor: "#FFFFFF",
  borderRadius: 25,
  padding: 25,

  elevation: 8,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 15,
  shadowOffset: {
    width: 0,
    height: 6,
  },
},
signupText:{
    color:"#4F46E5",
    fontWeight:"700",
    marginLeft:5,
    fontSize:16,
}
});