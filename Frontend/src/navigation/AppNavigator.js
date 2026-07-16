import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import LoginScreen from "../screens/Auth/LoginScreen.js";
import SignupScreen from "../screens/Auth/SignupScreen.js";
import HomeScreen from "../screens/Home/HomeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
     
    return(

        <Stack.Navigator  screenOptions={{headerShown : false}}>

           
      <Stack.Screen name="Signup" component={SignupScreen}/>

      <Stack.Screen name = "Home" component={HomeScreen}/>

           
        </Stack.Navigator>
    )
}