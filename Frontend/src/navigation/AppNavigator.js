import { createNativeStackNavigator } from "@react-navigation/native-stack";


import SignupScreen from "../screens/Auth/SignupScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator(){
     
    return(

        <Stack.Navigator  screenOptions={{headerShown : false}}>
            <Stack.Screen name="Login" component={LoginScreen}/>

            <Stack.Screen name="Signup" component={SignupScreen}/>

            <Stack.Screen name = "Home" component={HomeScreen}/>

           
        </Stack.Navigator>
    )
}