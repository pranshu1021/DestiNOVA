import { StatusBar } from 'expo-status-bar';
import { StyleSheet,
   Text,
    View ,
     Pressable,
      Image,
       TextInput,
        ScrollView,
        SafeAreaViewBase} from 'react-native';
        import {SafeAreaView} from "react-native-safe-area-context";
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from "./src/navigation/AppNavigator.js";


export default function App() {

  return (
    <NavigationContainer>
         <AppNavigator/>
</NavigationContainer>
  );
}


 


