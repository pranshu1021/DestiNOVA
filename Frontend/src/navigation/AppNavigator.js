import { createNativeStackNavigator } from "@react-navigation/native-stack";

import React, {
    useContext
} from "react"



import {AuthContext} from "../context/AuthContext"

import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import HomeScreen from "../screens/Home/HomeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
     const {token,loading} = useContext(AuthContext);
     if (loading){
        return null;
     }
    return(
   
        <Stack.Navigator  screenOptions={{headerShown : false}}>
            {token ? (
                <Stack.Screen name = "Home" component={HomeScreen}/>)
                :
                (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            />
                        <Stack.Screen   
                            name = "Signup"
                            component={SignupScreen}
                            />
                    </>
                )
            }
            
            

           
        </Stack.Navigator>
       
    )
}