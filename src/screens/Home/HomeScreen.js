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


export default function HomeScreen() {


  return (
    <SafeAreaView style={styles.container}>
   
      <ScrollView >

    
    <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style= {styles.name}>Pranshu</Text>
    </View>
    <Pressable style = {styles.Notification}>
      <Text style={styles.icon}>🔔</Text>
    </Pressable>

    <View style={styles.searchBar}>
      <Text style={styles.searchText}>Search Astrologers</Text>

    </View>

    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>
        Daily Horoscope
      </Text>
            <Text style={styles.bannerSubtitle}>
        Discover what the stars have planned for you today.
      </Text>
    </View>
<Text style={styles.sectionTitle}>
  Categories
</Text>

    <View style = {styles.categoryContainer}>
      <Pressable style={styles.category} >
        <Text>
          Horoscope
        </Text>
      </Pressable>
            <Pressable style={styles.category}>
        <Text>
          Kundli
        </Text>
      </Pressable>
            {/* <Pressable style={styles.category}>
        <Text>
          Match-Making
        </Text>
      </Pressable> */}
            <Pressable style={styles.category}>
        <Text>
          Ai Chat
        </Text>
      </Pressable>

    </View>

    
      <Text style={styles.sectionTitle}>Today's Prediction</Text>

      <View style={styles.card} >
        <Text style={styles.cardTitle}>Cancer</Text>

        <Text style={styles.cardText}> Cancer, you have good intuition today, so follow your gut and support a buddy in need. Spend some time unwinding and clearing your head.</Text>
        <Text style={styles.cardText}>
          Lucky Color : Blue
        </Text>
                <Text style={styles.cardText}>
          Lucky Number : 7
        </Text>
                <Text style={styles.cardText}>
          Lucky Alphabet : B
        </Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}> 
        Dummy Name
      </Text>
      <Text > 
        4.6 Rating
      </Text>
      <Text > 
      10+ Years Experience
      </Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}> 
        Dummy Name 2
      </Text>
      <Text > 
        4.1 Rating
      </Text>
      <Text > 
      15+ Years Experience
      </Text>
    </View>

    <View style={styles.premium}>
      <Text style={styles.premiumTitle}>
        Unlock Premium Astrology
      </Text>
            <Text style={styles.premiumText}>
        AI Chat, Tarot Reading, Premium Predictions and more.
      </Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}> Upgrade Now</Text>
      </Pressable>
    </View>
    </ScrollView>
    <StatusBar styles="auto"/>
   </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 50,
    justifyContent: 'center',
  },
  header: {
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    paddingHorizontal:20,
  },
  Notification:{
    width:50,
    height:50,
    borderRadius: 20,
    backgroundColor: "lightgray",
    justifyContent:"center",
    alignItems:"center",
    marginHorizontal:20
  },
  icon:{
    fontSize:18,
    
  },
  greeting:{
    fontSize:16,
    color:"gray"
  },
  name:{
    fontSize:25,
    fontWeight: "bold",
    color: "black",
    marginTop: 5

  }
  ,
  searchBar:{
    height:50,
    backgroundColor:"lightgray",
    marginHorizontal:20,
    marginTop: 20,
    borderRadius: 12,
    justifyContent:"center"
    ,paddingHorizontal: 15,

  }
  ,
  searchText:{
    color:"gray",
    fontSize: 13
  },
  banner:{
    backgroundColor:"lavender",
    margin:20,
    borderRadius: 15,
    padding: 20,
  }
  ,bannerTitle:{
    fontSize:22,
    fontWeight:"bold"
  },
  sectionTitle:{
    fontSize:22,
    fontWeight:"bold",
    marginHorizontal:20
  },
  categoryContainer:{
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25
  },
  category:{
    backgroundColor:"lightgray",
    padding:12,
    borderRadius:10,
    width:100,
    textAlign:"center",
    alignItems:"center"
  },
  card:{
    backgroundColor:"whitesmoke",
    marginHorizontal:20,
    marginBottom: 20,
    padding:20,
    borderRadius:20
  },
  cardTitle:{
    fontSize:16,
    marginTop:5,

  },
  premium:{
    backgroundColor:"#f2e54a80",
    margin:20,
    padding:20,
    borderRadius:15,
    marginBottom:40
  },
  premiumTitle:{
    fontSize: 22,
    fontWeight:"bold"
  },
  button:{
    marginTop:20,
    backgroundColor:"black",
    padding: 15,
    borderRadius: 10,
    alignItems:"center"
  },
  buttonText:{
    color:"whitesmoke"
    ,fontSize: 18,
    fontWeight:"bold"
  }
});
