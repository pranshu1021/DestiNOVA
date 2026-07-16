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

        export default function NewsCard(){
    return (
      
      <ScrollView >
<View style={styles.cardComponent} >
   <Image style={styles.cardImg} source={{uri:"https://media.istockphoto.com/id/2155897753/photo/man-in-orange-attire-at-a-vibrant-haldi-ceremony-against-a-yellow-backdrop.webp?a=1&b=1&s=612x612&w=0&k=20&c=kRUQEANt3AoFib_MTsHiq6n9f6Vrpx5d2DADKD23stk="}}></Image>
   <Text style={styles.cardPara}>Pranshu gupta has good suggestion about the business remedies and he has good experience in his field.</Text>
   <View style={styles.aboutPriest}>

   <Text style={styles.speciality} >Business Remedies</Text>
  <Text style={styles.dateOfJoin}>01/03/2006</Text>
   </View>
 

</View>

 </ScrollView>

    );
        }


 const styles = StyleSheet.create({
  

  cardComponent: {
   backgroundColor:"#6E5C83",
   height:300,
   width:300,
   borderRadius:20,
   marginLeft:20,
   elevation:10,
   marginBottom:20,
  },

  cardPara:{
   color:"#F6F6EE",
   padding:5,
   paddingLeft:10,
  },

  cardImg:{
   height:200,
   width:"auto",
   overflow:"hidden",
   objectFit:"cover",
   borderRadius:20,
   
  },

  aboutPriest:{
   display:'flex',
   flexDirection:"row",
   justifyContent:"space-between",
   padding:5,
  },

  speciality:{
   color:"#F6F6EE",
   textShadowColor:"black",
  },

  dateOfJoin:{
   color:"#F6F6EE",
   textShadowColor:"black",

  }


})
  