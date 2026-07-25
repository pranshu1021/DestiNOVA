import { createNativeStackNavigator } from "@react-navigation/native-stack";

import React, {
    useContext
} from "react"



import {AuthContext} from "../context/AuthContext"

import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import NamePage from "../screens/Screenspages/NamePage";
import GenderPage from "../screens/Screenspages/GenderPage";
import BirthTimePage from "../screens/Screenspages/BIrthTimePage";
import DateOfBirthPage from "../screens/Screenspages/DateOfBIrthPage";
import PlaceOfBirthPage from "../screens/Screenspages/PlaceOFBIrthPage";

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
     const {token,loading} = useContext(AuthContext);
     if (loading){
        return null;
     }
    return(
   
        <Stack.Navigator  screenOptions={{headerShown : false}}>
          
            {token ? (<>
                  <Stack.Screen name="Preview" component={NamePage}/>
            <Stack.Screen name = "Gender" component={GenderPage}/>
            <Stack.Screen name = "Birth" component={BirthTimePage}/>
             <Stack.Screen name = "BirthDate" component={DateOfBirthPage}/>
             <Stack.Screen name = "BirthPlace" component={PlaceOfBirthPage}/>
                <Stack.Screen name = "Home" component={HomeScreen}/>
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