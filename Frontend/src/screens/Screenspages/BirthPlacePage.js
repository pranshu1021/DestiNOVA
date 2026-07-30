import React,{useState,useContext, useRef, useEffect} from "react";
import {View,StyleSheet,Platform,TouchableOpacity,Text,Alert, Keyboard,TextInput, ActivityIndicator} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { searchPlaces } from "../../services/locationIQ";
import OnboardingLayout from "../../components/OnboardingLayout";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";


export default function BirthPlacePage(){
    const navigation = useNavigation();
    const {updateUser} = useContext(AuthContext);
    const {colors, borderRadius, shadows} = useContext(ThemeContext);

    const [search,setSearch] = useState("");
    const [places, setPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [loading,setLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error,setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // debounce ==> api locationIQ -> load balancing --> api usage optimization 

    const debounceRef = useRef(null);

    /// Debounced Place searches
    useEffect(()=>{
        if(debounceRef.current){
            clearTimeout(debounceRef.current);
        }

        if(search.trim().length <2 ){
            setPlaces([]);
            setLoadingPlaces(false);
            return;
        }

        // skip the trigger agar they just selected a plaec --> search matches display name exactly
        if(selectedPlace && search === selectedPlace.display_name){
            return; 
        }

//[dehradun , delhi,dubai]   
        debounceRef.current = setTimeout(async ()=>{
            try{
                setLoadingPlaces(true);
                setError("");

                const result = await searchPlaces(search);
                setPlaces(result);
                if(result.length ===0){
                    setError("No places Found")
                }
            }
            catch(err){
                console.log("Search Error: ",err)
                setError("Unable to search location");
            }
            finally{
                setLoadingPlaces(false);
            }
        }, 450);

        return() =>{
            if(debounceRef.current){
                clearTimeout(debounceRef.current);

            }
        }
    },[search,selectedPlace]);

    const handleSelect = (item) =>{
        Keyboard.dismiss();
        setSelectedPlace(item);
        setSearch(item.display_name);
        setLatitude(item.lat);
        setLongitude(item.lon);
        setPlaces([]);
        setError("");
    }

    const handleContinue = async()=>{
        if(!selectedPlace) return;

        try{
            setLoading(true);
            const response = await api.put("/update-profile",{
                birthPlace: selectedPlace.display_name,
                birthLatitude: Number(latitude),
                birthLongitude:Number(longitude),
                profileCompleted: true,
            });

            if(response.data.success){
                await updateUser(response.data.user);
            }
            else{
                Alert.alert("Error", response.data.message || "Failed to update profile");
            }
        }
        catch(err){
            console.log("BirthPlacePage Error: ", err);
            Alert.alert(
                "Connection Error",
                err.response?.data?.message || "Failed to connect to the server."
            )
        }
        finally{
            setLoading(false);
        }
    }
    const handleSkip = async()=>{
        try{
            setLoading(true);
            const response = await api.put("/update-profile",{
                profileCompleted:true,
            });

            if(response.data.success){
                await updateUser(response.data.user);
            }
            else{
                Alert.alert("Error", response.data.message || "Failed to complete onboarding.");
            }

        }
        catch(err){
            console.log("Skip Onboarding Error: " , err);
            Alert.alert("Error", "Failed to connect to the server. Please try again.");

        }
        finally{
            setLoading(false);
        }
    };
    const handleBack =()=> {
        navigation.goBack()
    };

    return (
        <OnboardingLayout
        onBack={handleBack}
        currentStep={5}
        iconName="location"
        title="Where were you born?"
        subtitle="Search your city or town. We'll use this location for accurate birth chart calculations."
        isScrollable={true}
        onContinue={handleContinue}
        continueDisabled={!selectedPlace}
        continueLoading = {loading}
        onSkip={handleSkip}
        skipText = "Skip and Finish"
        continueText = "Finish">
            <View style = {styles.contentContainer}>
                <View style = {[
                    styles.searchContainer,
                    {
                        backgroundColor: colors.card,
                        borderColor:colors.border,
                        borderRadius: borderRadius.md,
                        ...shadows.soft,
                    },
                    isFocused && {borderColor: colors.primary, shadowColor: colors.primary,
                        shadowOpacity: 0.08
                    }
                ]}>
                    <Ionicons name ="search" 
                    size={20} color ={isFocused ? colors.primary : colors.textMuted}
                    />
                    <TextInput 
                    style={[styles.searchInput,
                        {color: colors.textMain}
                    ]}
                    placeholder = "Search city, town or village..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText = {(text) => {
                        setSearch(text)
                        if(selectedPlace && text !== selectedPlace.display_name){
                            setSelectedPlace(null);
                            setLatitude(null);
                            setLongitude(null);
                        }
                    }}
                    autoCorrect = {false}
                    autoCapitalize="words"
                    onFocus = {()=> setIsFocused(true)}
                    onBlur = {()=> setIsFocused(false)}
                    disabled = {loading}
                    />
                    {
                        loadingPlaces && (
                            <ActivityIndicator size = "small" color={
                                colors.primary
                           }
                           style={styles.loader}/>
                           
                        )
                    }

                </View>

                {!!error && <Text style ={styles.errorText}>{error}</Text>}


                {places.length > 0 && (
                    <View style = {[styles.resultList, {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius:borderRadius.md
                    }]}>
                        {places.map((item)=>(
                            <TouchableOpacity 
                            key = {item.place_id}
                            activeOpacity={0.8}
                            style ={[styles.placeCard, {
                                borderBottomColor: colors.border
                            }]}
                            onPress={()=>handleSelect(item)}>
                                <Ionicons name = "location-outline" size = {20} 
                                color= {colors.primary}/>
                                <View style = {styles.placeTextContainer}>
                                    <Text numberOfLines={2} style={[styles.placeText,{
                                        color: colors.textMain
                                    }]}>
                                        {item.display_name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        </View>
                )}

                {
                    selectedPlace && (
                        <View style = {[styles.selectedContainer, {
                            backgroundColor: colors.successBg || "#ECFDF5", borderColor:
                            colors.success,   borderRadius: borderRadius.md
                        }]}>
                            <Ionicons name ="checkmark-circle" size={20} 
                            color={colors.success}/>
                            <View style = {styles.selectedTextContainer}>
                                <Text style = {[styles.selectedText, {
                                    color: colors.success
                                }]}>
                                    Selected Location
                                </Text>
                                <Text style = {[styles.selectedPlaceText, {
                                    color: colors.textMain
                                }]}>
                                    {
                                        selectedPlace.display_name
                                    }
                                </Text>
                            </View>
                            </View>
                    )
                }
            </View>
        </OnboardingLayout>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        marginVertical:10, 
        width: "100%",
    },
    searchContainer:{
        flexDirection:"row",
        alignItems:"center",
        paddingHorizontal:16,
        height: 55,
        borderWidth: 1.5,
    },
    searchInput:{
        flex:1,
        marginLeft:12,
        fontSize: 15,
    },
    loader:{
        marginLeft: 8
    },
    errorText:{
        marginTop: 10,
        color: "EF4444"
        ,fontSize: 14,
        fontWeight: "600",
        textAlign:"center",

    },
    resultList:{
        marginTop: 15,
        borderWidth: 1,
        overflow:"hidden",

    }
    ,
    placeCard:{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal:16,
        borderBottomWidth: 1,

    },
    placeTextContainer:{
        flex: 1,
        marginLeft: 12,
    },
    placeText:{
        fontSize:14,
        lineHeight:18,

    },
    selectedContainer:{
        flexDirection: "row",
        alignItems: "center"
        ,
        marginTop: 20,
        padding:16,
        borderWidth: 1.5,

    },
    selectedTextContainer:{
        marginLeft: 12,
        flex: 1,

    },
    selectedTitle:{
        fontWeight: "700",
        fontSize:"13",
        textTransform:"uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    selectedPlaceText:{
        fontSize: 14, 
        lineHeight:20,
    }

})