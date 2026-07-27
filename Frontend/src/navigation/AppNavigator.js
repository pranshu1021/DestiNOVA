import { createNativeStackNavigator } from "@react-navigation/native-stack";

import React, {
    useContext
} from "react"



import {AuthContext} from "../context/AuthContext"

import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import Home from "../screens/Home/HomeScreen";

import Name from "../screens/Screenspages/NamePage";
import Gender from "../screens/Screenspages/GenderPage";
import DateOfBirth from "../screens/Screenspages/DateofBirthPage";
import BirthTime from "../screens/Screenspages/BirthTimePage";
import PlaceOfBirth from "../screens/Screenspages/BirthPlacePage";

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
     const {token,loading} = useContext(AuthContext);
     if (loading){
        return null;
     }
    return(
   
        <Stack.Navigator  screenOptions={{headerShown : false}}>
          
            {token ? (<>
            {/* <Stack.Screen name="Name" component={Name}/>
            <Stack.Screen name = "Gender" component={Gender}/>
            <Stack.Screen name = "DateOfBirth" component={DateOfBirth}/>
            <Stack.Screen name = "BirthTime" component={BirthTime}/>
            <Stack.Screen
    name="BirthPlace"
    component={PlaceOfBirth}
  /> */}
                <Stack.Screen name = "Home" component={Home}/>
            </>
            )
                

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