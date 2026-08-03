import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function AstroSignup(){

  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");
  const[email,setEmail]=useState("");
  const [experience,setExperience]=useState("");
  const[city,setCity]=useState("");
  const[country,setCountry]=useState("");


  const handleSubmit = () => {
    Alert.alert(
      "Request Submitted",
      "Our representative will call you soon."
    );
  };

  return(
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Become An Astrologer
      </Text>

      <Text style={styles.subtitle}>
        Join DestiNOVA as an astrologer and connect with users.
      </Text>


      <View style={styles.termsBox}>
        <Text style={styles.heading}>
          Terms & Conditions
        </Text>

        <Text>
            
           Provide genuine information 
           Maintain professional communication
           Follow platform guidelines
        </Text>
      </View>


      <Text style={styles.heading}>
        Registration Details
      </Text>


      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />


      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput placeholder="Email"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      style={styles.input}
      />
      <TextInput placeholder="Experience"
      value={experience}
      onChangeText={setExperience}
      keyboardType="numeric"
      style={styles.input}
      />
      <TextInput placeholder="City"
      value={city}
      onChangeText={setCity}
      
      style={styles.input}
      />
      <TextInput placeholder="Country"
      value={country}
      onChangeText={setCountry}
   
      style={styles.input}
      />
    


      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>
          Request To Join
        </Text>
      </TouchableOpacity>


    </ScrollView>
  )
}


const styles = StyleSheet.create({

container:{
 flex:1,
 padding:20,
 backgroundColor:"#fff"
},

title:{
 fontSize:28,
 fontWeight:"bold",
 marginTop:20
},

subtitle:{
 marginTop:10,
 color:"gray"
},

heading:{
 fontSize:18,
 fontWeight:"bold",
 marginTop:25,
 marginBottom:10
},

termsBox:{
 padding:15,
 backgroundColor:"#f5f5f5",
 borderRadius:10
},

input:{
 height:50,
 borderWidth:1,
 borderColor:"#ddd",
 borderRadius:10,
 paddingHorizontal:15,
 marginBottom:15
},

button:{
 backgroundColor:"#FF8A00",
 padding:15,
 borderRadius:10,
 alignItems:"center",
 marginTop:20
},

buttonText:{
 color:"white",
 fontSize:17,
 fontWeight:"bold"
}

});
