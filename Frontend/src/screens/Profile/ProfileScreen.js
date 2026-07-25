import React, {useState,useRef} from "react";
import {
    View,
    TouchableOpacity,
    Text,
StyleSheet,
ScrollView,
KeyboardAvoidingView,
Platform
} from 'react-native';
 import {SafeAreaView} from "react-native-safe-area-context";
 import {Ionicons} from "@expo/vector-icons";
 import DateTimePicker from "@react-native-community/datetimepicker";
 const LOCATIONIQ_API_KEY="pk.5631049db4dbcb754e23d3b92e15357a";
 import debounce from "lodash.debounce";
    

 export default function ProfileScreen({navigation}){
      const [birthDate,setBirthDate]=useState(new Date(1998,8,28));
      const [birthTime,setBirthTime]=useState(new Date(1998,8,28,7,0));
      const[birthPlace,setBirthPlace]=useState("New Delhi, India") 
      const[birthCoords,setBirthCoords]=useState({lat:28.6139,lng:77.209});



      const[suggestions,setSuggestions]=useState([]);
      const [isSearching,setIsSearching]=useState(false);
      const[showSuggestion,setShowSuggestion]=useState(false);
      const[showDatePicker,setShowDatePicker]=useState(false);
      const[showTimePicker,setTimePicker]=useState(false);
    

      
    const onChangeData=(event,selectedDate)=>{
        setShowDatePicker(Platform.OS==="ios");
        if(selectedDate){
            setBirthDate(selectedDate)
        }
    }
    const onChangeTime=(event,selectedTime)=>{
        setShowTimePicker(Platform.OS==="ios");
        if(selectedTime){
            setBirthTime(selectedTime)
        }
    }
    const formatDate=(date)=>{
        date.toLocaleDateString("en-GB",{
            day:"2-digit",
            month:"long",
            year:"numeric"
        })
    }
    
const formatTime=(date)=>{
        date.toLocaleDateString("en-US",{
            hour:"2-digit",
            minute:"2-digit",
            hour12:true,
        })
    }
    const fetchPlaceSuggestions=async (text)=>{
        if(text.length<3){
            setSuggestions([]);
            return;

        }
        try{
            setIsSearching(true);
            const url=`https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
        text
      )}&limit=6&format=json`;
      const response=await fetch(url);
      const data=await response.json();

      if(Array.isArray(data)){
        setSuggestions(data);
      } else{
        setSuggestions([]);
      }

        }
        catch(error){
            console.log(error)
            setSuggestions([]);
        }
        finally{
            setIsSearching(false);
        }


    }
    const debouncedFetch=useRef(debounce(fetchPlaceSuggestions,400)).current;
    
    const handlePlaceInputChange=(text)=>{
        setBirthPlace(text);
        setShowSuggestions(true);
        debouncedFetch(text);
    }
    const handleSelectPlace=(place)=>{
        setBirthPlace(place.display_name);
        setBirthCoords({lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),});
      setSuggestions([]);
      setShowSuggestions(false);
    }
    const handleSave=()=>{
        const payload={
            birthDate:birthDate.toISOString(),
            birthTime:birthTime.toISOString(),
            birthPlace,birthCoords

        } 
        console.log("saving profile:" ,payload)
    }

 }

