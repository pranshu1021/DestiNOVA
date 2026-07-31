import React ,{useContext} from 'react';
import {view ,Text,StyleSheet, View} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { TouchableOpacity } from 'react-native';

export default function AstroDrawer(){
    const {colors,typography,borderRadius,animations,icons,shadow}=useContext(ThemeContext);
    return (
     <View style={styles.container}> 
          <TouchableOpacity style={styles.button} onPress={onPress}>
         <Text>myprofile</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text> Premium upgrade</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onPress}>
           <Text> Daily horoscope</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onPress}>
         <Text>Ai astrology </Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onPress}>
         <Text>notifications</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onPress}>
         <Text> Help and support</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onPress}>
         <Text> logout</Text>
        </TouchableOpacity>
     </View>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
 
});