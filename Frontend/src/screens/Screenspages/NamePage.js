import React ,{useState} from 'react';
import {
    View,TouchableOpactiy, Text,StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Pressable,
   
    TextInput
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

export default function NamePage(){
return (
    <SafeAreaView style={styles.container}>
 <ScrollView>
 <View>
 <Text style={{color:"white"}}>Hey there,
    What's your name 
 </Text>
 <TextInput placeholder='Enter your name here :'/>
 <Pressable><Text>Next</Text></Pressable>
 </View>
 </ScrollView>
 </SafeAreaView>
);
}

const styles=StyleSheet.create({
    container:{
    flex:1,
    backgroundColor: 'purple',
    alignItems: 'center',
    paddingTop: 50,
    justifyContent: 'center',
    
    }

});