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

        export default function AstrologerCard(){
         return(
       
            
               <ScrollView >
                  <View style={styles.main}>
<Image style={styles.image} source={{uri:"https://images.unsplash.com/photo-1659355893883-32e3d9f84baf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}} />
<View style={styles.name}>
   <Text style={styles.astroname}>Tarot Mamta</Text>
   <Text style={styles.price}>₹ 154/min</Text>
</View>

<Pressable style = {styles.button}>
      <Text style={styles.butnname}>Chat</Text>
    </Pressable>
</View>
</ScrollView>   
   
         );
        }

        const styles=StyleSheet.create({
  main:{
backgroundColor:"#6E5C87",
width:150,
padding:20,
margin:20,
borderRadius:30,
elevation:6,
  },
astroname:{
   fontWeight:"600",
fontSize:18,
marginTop:10,
color:"#F6F6EE"
},
price:{
fontSize:12,
fontWeight:"500",
color:"#1E1729",
marginTop:5,

},
image:{
   width:100,
   height:100,
  borderRadius:50,
   borderWidth:3,
   borderColor:"#1E1729",
   elevation:3,
},
button:{
marginTop:10,
alignItems:"center",

borderRadius:30,
borderWidth:1,
borderColor:"#F6F6EE",
},
butnname:{
color:"#1E1729",

},




        })
        