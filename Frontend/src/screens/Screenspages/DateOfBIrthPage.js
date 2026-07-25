import React ,{useState} from 'react';
import {
    View,TouchableOpactiy, Text,StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Pressable,
   
    TextInput
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

export default function DateOfBirthPage(){
return (
    <SafeAreaView style={styles.container}>
 <ScrollView>
 <View>
 <Text style={{color:"white"}}>Enter Your Date of birth
 </Text>
 <TextInput />
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

})