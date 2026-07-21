import React, { useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Image
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../../services/api"
import {useContext} from "react";
import {AuthContext} from "../../context/AuthContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {useEffect} from "react";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "../../config/googleAuth"; //google client ID
// import * as Google from "expo-auth-session/providers/google"; // this is for auth...
// import * as WebBrowser from "expo-web-browser"; //browser ko automatically close karte h iski help se
import { GoogleSignin,statusCodes } from "@react-native-google-signin/google-signin";

// iska use browser ko close krne ke liye 
// aur sirf ek baar app load hone par chalega
// WebBrowser.maybeCompleteAuthSession();
export default function LoginScreen(){
    const navigation = useNavigation();
// states idhar rahengi
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const {login} = useContext(AuthContext);
    // const [request, response, promptAsync] = Google.useAuthRequest({
    //   androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    //   webClientId: GOOGLE_WEB_CLIENT_ID
    // })
 
    const handleLogin = async()=>{
        if(!email || !password){
            Alert.alert(
                "Error",
                "Please fill all fields"
            );
            return;
        }
        try{
            const response=await api.post("/login",{
              email,
              password
            })
            
            await login(
              response.data.token,
              response.data.user
            )
            Alert.alert(
              "Success",
              "Login Successful"
            );
            const user = await AsyncStorage.getItem("user");
           
           
           if(user){
            const parsedUser = JSON.parse(user);
            console.log(parsedUser.fullName);
           }

            const token = await AsyncStorage.getItem("token");
            console.log("Saved token");
            console.log(token);
            
            navigation.replace("Home");

            // await AsyncStorage.clear();

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

       const handleGoogleLogin= async() =>{
        // try{

        //   await GoogleSignin.signOut(); //pehle se mehak signed in h toh signout  krra hu
        //   await GoogleSignin.hasPlayServices(); //checking google play services check

        //   const userInfo = await GoogleSignin.signIn();// google acc picker h yeh 
        //   console.log("Google User:", userInfo);
        // }
        // catch(error){
        //   if(error.code === statusCodes.SIGN_IN_CANCELLED){
        //     console.log("User cancelled Login");

        //   }
        //   else if( error.code ===statusCodes.IN_PROGRESS){
        //     console.log("Sign in already in progress")
        //   }
        //   else if(error.code===statusCodes.PLAY_SERVICES_NOT_AVAILABLE){
        //     Alert.alert("Google Play Services", "Please update Google Play Services.");
            
        //   }else{
        //     console.log("Google Login Error:", error)
        //   }
        // }
        try {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    console.log("========== GOOGLE LOGIN ==========");
    console.log(userInfo);
    console.log("=================================");

    Alert.alert("Success", "Google Login Success");

  } catch (error) {
    console.log("Google Error:", JSON.stringify(error, null, 2));
    Alert.alert("Error", JSON.stringify(error));
  }
    }
    // useEffect(()=>{
    //   if(!response) return;
    //   console.log("Google Response:",response);

    //         if(response.type ==="success"){
    //           console.log("Google Login Successful");

    //           console.log("Authentication:" , response.authentication)
    //         }
    //         else if(response.type ==="cancel"){
    //           console.log("User cancelled login.");
    //         }
    //         else{
    //           console.log("Google Login Failed.");
    //         }
    //         console.log("Google Response:",response);
    //       },[response])
        useEffect(()=>{
          GoogleSignin.configure({
            webClientId: GOOGLE_WEB_CLIENT_ID,
          },[])
        })
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



          <View style={{flexDirection:"row"
            ,alignItems:"center",
            marginVertical:20
          }}>
            <View
              style={{flex:1,
                height:1,
                backgroundColor:"black",
              }}
              />
                
              <Text>
                OR
              </Text>

              <View style={{flex:1,
                height:1,
                backgroundColor:"black"
              }} />
              
          </View>
          <TouchableOpacity onPress={handleGoogleLogin} style={{
            backgroundColor:"white",
           
            elevation:5,
            paddingVertical:14,
            borderRadius:10,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center",
          }}>
              <Image
        style={{
          width:24,
          height:24,
          marginRight:10,
        }}
        source={{
          uri:'https://yt3.googleusercontent.com/yqq5boPOuTo3s85oxX-DJjIhkeVN187TIEvYpCekcvuPMA9HepfOQpbWUN5w6Sn8gxlBZzPG=s900-c-k-c0x00ffffff-no-rj'
        }}
      />

            <Text>
              Continue with Google
            </Text>
          </TouchableOpacity>
          
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