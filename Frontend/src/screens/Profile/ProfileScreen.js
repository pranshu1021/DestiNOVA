import React, {useState, useContext, useRef} from "react";
import {
    View, 
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    ActivityIndicator 
} from "react-native";

import {SafeAreaView} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "@react-navigation/native";
import CosmicBackground from "../../components/CosmicBackground";
import { searchPlaces } from "../../services/locationIQ";

export default function ProfileScreen(){
    const navigation = useNavigation();
    const {user,updateUser} = useContext(AuthContext);
    const {colors,spacing,typography, borderRadius, shadows, isDark} = useContext(ThemeContext);
    

    // states 
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // pehle se data show kar rhe hai user ka jo humare paas already hai
    const [fullName, setFullName] =useState(user?.fullName || "");
    const [phone,setPhone] =  useState(user?.phone || "");
    const [gender,setGender] = useState(user?.gender || "");


        // date and time picker states
    const [dateOfBirth, setDateOfBirth] = useState(
        user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date()
    );

    const [birthTime, setBirthTime] = useState(user?.birthTime || "12:00 AM");

    // picker show karne ke liye states

    const[showDatePicker, setShowDatePicker] = useState(false);
    const[showTimePicker, setShowTimePicker] = useState(false);

    // location suggestions states
    const [birthPlace, setBirthPlace] = useState(user?.birthPlace || "");
    const [latitude, setLatitude] = useState(user?.birthLatitude || null);
    const [longitude, setLongitude] = useState(user?.birthLongitude || null);

    const [places, setPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    const debounceRef = useRef(null);

    const handlePlaceSearch = (text) =>{
        setBirthPlace(text);
        if(text.trim().length <2){
            setPlaces([]);
            return;
        }

        if(debounceRef.current){
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(
            async()=>{
                try{
                    setLoadingPlaces(true);
                    const result  = await searchPlaces(text);
                    setPlaces(result)
                }
                catch(err){
                    console.log("AutoComplete Error: ", err);
                }
                finally{
                    setLoadingPlaces(false);
                }
            },404)
    }

    const handleSelectPlace=(item) =>{
        setBirthPlace(item.display_name);
        setLatitude(Number(item.lat));
        setLongitude(Number(item.lon));
        setPlaces([])
    }

    // date picker handler hai niche
    const handleDateChange = (event,selectedDate)=>{
        setShowDatePicker(Platform.OS === "ios");
        if(selectedDate){
            setDateOfBirth(selectedDate);
        }
    };
// en -US
    const handleTimeChange = (event, selectedTime)=>{
        setShowTimePicker(Platform.OS === "ios");
        if(selectedTime){
            const timeStr = selectedTime.toLocaleTimeString("en-US",{
                hour: "2-digit",
                minute:"2-digit",
                hour12:true
            });
            setBirthTime(timeStr);
        }
    }

    const formatDate = (value) => {
        if(!value) return "Not Added";
        return new Date(value).toLocaleDateString("en-IN",{
            day:"numeric",
            month:"long",
            year:"numeric"
        })
    }

    // save changes function
    const handleSave = async()=>{
        if(!fullName.trim()){
            Alert.alert("Required Field", "Name cannot be empty");
            return
        }
        try{
            setLoading(true);

            // form 
            const updateFields = {};

            if(fullName.trim() !== user?.fullName) updateFields.fullName = fullName.trim();
            if(phone.trim() !== user?.phone) updateFields.phone = phone.trim();
            //gender
            if(gender !== user?.gender) updateFields.gender = gender;

            const userDOB = user?.dateOfBirth? new Date(user.dateOfBirth).toISOString() : null;
            const selectDOB = dateOfBirth.toISOString();

            if(selectDOB !== useDOB) updateFields.dateOfBirth = selectDOB;

            if(birthTime !== user?.birthTime) updateFields.birthTime = birthTime;

            if(birthPlace !== user?.birthPlace){
                updateFields.birthPlace = birthPlace;
                updateFields.birthLatitude = latitude;
                updateFields.birthLongitude = longitude;
            }

            if(Object.keys(updateFields).length === 0){
                setIsEditing(false);
                setLoading(false);
                return;
            }

            const response = await api.put("/update-profile",updateFields);
            
            if(response.data.success){
                await updateUser(response.data.user);
                setIsEditing(false);
                Alert.alert("Success","Profile updated successfully");
            }
            else{
                Alert.alert("Error",
                    response.data.message || "Failed to update your  profile"
                )
            }

        }
        catch(error){
            console.log("ProfileSave error agya: ", error);
            Alert.alert("Error", "Could not save your  profile details. Please try again.");
        }
        finally{
            setLoading(false);
        }
    };


    const handleCancel =()=>{
        // reset kar rhe hai
        setFullName(user?.fullName || "");
        setPhone(user?.Phone || "");
        setGender(user?.gender || "");
        setDateOfBirth(user?.dateOfBirth ? new Date(user.dataOfBirth) : new Date());
        setBirthTime(user?.birthTime || "12:00 AM");
        setBirthPlace(user?.birthPlace || "");
        setLatitude(user?.birthLatitude || null) 
         setLongitude(user?.birthLongitude || null) 
         setPlaces([]);
         setIsEditing(false);
    }

    const handleStartEdit =()=>{
        setIsEditing(true);
    }

    return(
        <CosmicBackground>
            <SafeAreaView style = {styles.safeContainer} edges={"top","left","right"}>
                {/* Header */}

                <View style ={[styles.header,{
                    backgroundColor:colors.card,
                    borderBottomColor:colors.border
                }]}>
                    <TouchableOpacity style ={[
                        styles.backButton,
                        {backgroundColor: colors.primaryLight}
                    ]}
                    activeOpacity={0.7}
                    onPress={()=> navigation.goBack()}
                    disabled={loading}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.primary}/>
                        </TouchableOpacity>
                        <Text Style ={[styles.headerTitle,
                            {
                                fontSize: typography.sizes.h3,
                                fontWeight: typography.weights.bold,
                                color:colors.textMain
                            }
                        ]} >
                            DestiNOVA Profile
                        </Text>
                        <View style ={{width:40}}/>
                </View>

                <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, 
                    {
                        paddingBottom: spacing.giant
                    }
                ]}
                keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Area  */}

                    <View style = {[
                        styles.avatarSection,
                        {
                            backgroundColor:colors.card,
                            borderBottomColor: colors.border,
                            paddingVertical: spacing.xxxl
                        }
                    ]}>
                        {user?.photo? (
                            <Image source={{uri:user.photo}} style={
                                [styles.avatar, {
                                    borderColor: colors.primary
                                }]
                            }/>
                        ):
                        (
                            <View style ={[styles.avatarPlaceholder,
                                {
                                    backgroundColor:colors.primaryLight,
                                    borderColor: colors.primary
                                }
                            ]}>
                                <Ionicons name ="person" size ={48} color ={colors.primary}/>
                                </View>
                        )}
                        <Text style = {[styles.profileName, 
                            {fontSize: typography.sizes.h2,
                             fontWeight:typography.weights.bold,
                             color: colors.textMain
                            }
                        ]}>
                            {user?.fullName}
                        </Text>

                    <Text style={[styles.profileEmail,{
                        fontSize: typography.sizes.body,
                        colors: colors.textSub
                    }]}>
                        {user?.email}
                    </Text>
                    </View>

                    {/* View MODE container hai niche */}

                    {isEditing? (
                        <View style = {[styles.infoSection,
                            {paddingHorizontal: spacing.xxl,
                                paddingTop: spacing.lg
                            }
                        ]}>
                            <Text style= {[styles.sectionHeader,{
                                fontSize:typography.sizes.large,
                                fontWeight:typography.weights.bold, color: colors.primaryDark,
                                marginTop: spacing.lg,
                                marginBottom: spacing.sm
                            }]}>
                                Personal Details
                            </Text>

                            <View style = {[styles.infoCard,
                                {backgroundColor: colors.card,
                                    borderColor: colors.border,
                                    paddingHorizontal: spacing.lg 
                                    ,
                                    ...shadows.soft
                                }
                            ]}>
                                <View style = {[styles.infoRow,
                                    {
                                        paddingVertical: spacing.lg
                                    }
                                ]}>
                                    <Text style ={[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Full Name
                                    </Text>
                                     <Text style ={[styles.infoValue, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.semiBold,
                                        color: colors.textMain
                                    }]}>
                                        {user?.fullName}
                                    </Text>
                                </View>
                                <View style ={[styles.divider,
                                    {
                                        backgroundColor: colors.border
                                    }
                                ]}/>
                                 <View style = {[styles.infoRow,
                                    {
                                        paddingVertical: spacing.lg
                                    }
                                ]}>
                                    <Text style ={[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Email
                                    </Text>
                                     <Text style ={[styles.infoValue, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.semiBold,
                                        color: colors.textMain
                                    }]}>
                                        {user?.email}
                                    </Text>
                                </View>
                                <View style ={[styles.divider,
                                    {
                                        backgroundColor: colors.border
                                    }
                                ]}/>

                                <TouchableOpacity
                                 activeOpacity={user?.phone ? 1 : 0.7}
                                 onPress={()=>{
                                    if(!user?.phone) handleStartEdit();
                                 }}
                                 style = {[styles.infoRow,
                                    {paddingVertical: spacing.lg}
                                 ]}>

                                    <Text style = {[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Phone Number
                                    </Text>
                                    <Text style ={[
                                        styles.infoValue,
                                        {
                                            fontSize: typography.sizes.body,
                                            fontWeight:typography.weights.semiBold,
                                            color:colors.textMain
                                        },
                                        !user?.phone && [styles.notAddedText,{
                                            color:colors.warning
                                        }]
                                    ]}>
                                        {user?.phone || "Not Added"}
                                    </Text>
                                 </TouchableOpacity>
                            </View>

                            {/* Astrology details of our users */}
                             <Text style= {[styles.sectionHeader,{
                                fontSize:typography.sizes.large,
                                fontWeight:typography.weights.bold, color: colors.primaryDark,
                                marginTop: spacing.lg,
                                marginBottom: spacing.sm
                            }]}>
                                Birth Details
                            </Text>

                             <View style = {[styles.infoCard,
                                {backgroundColor: colors.card,
                                    borderColor: colors.border,
                                    paddingHorizontal: spacing.lg 
                                    ,
                                    ...shadows.soft
                                }
                            ]}>
                                <View style = {[styles.infoRow,
                                    {
                                        paddingVertical: spacing.lg
                                    }
                                ]}>
                                    <Text style ={[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Gender
                                    </Text>
                                     <Text style ={[styles.infoValue, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.semiBold,
                                        color: colors.textMain
                                    }]}>
                                        {user?.gender || "Not Added"}
                                    </Text>
                                </View>
                                <View style ={[styles.divider,
                                    {
                                        backgroundColor: colors.border
                                    }
                                ]}/>

                                <View style = {[styles.infoRow,
                                    {
                                        paddingVertical: spacing.lg
                                    }
                                ]}>
                                    <Text style ={[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Date of Birth
                                    </Text>
                                     <Text style ={[styles.infoValue, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.semiBold,
                                        color: colors.textMain
                                    }]}>
                                        {formatDate(user?.dateOfBirth)}
                                    </Text>

                                </View>
                                <View style ={[styles.divider,
                                    {
                                        backgroundColor: colors.border
                                    }
                                ]}/>
                                 <View style = {[styles.infoRow,
                                    {
                                        paddingVertical: spacing.lg
                                    }
                                ]}>
                                    <Text style ={[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Time of Birth
                                    </Text>
                                     <Text style ={[styles.infoValue, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.semiBold,
                                        color: colors.textMain
                                    }]}>
                                        {user?.birthTime || "Not Added"}
                                    </Text>
                                </View>
                                <View style ={[styles.divider,
                                    {
                                        backgroundColor: colors.border
                                    }
                                ]}/>
                                <View style = {[styles.infoRow,
                                    {
                                        paddingVertical: spacing.lg
                                    }
                                ]}>
                                    <Text style ={[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Place of Birth
                                    </Text>
                                     <Text style ={[styles.infoValue, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.semiBold,
                                        color: colors.textMain
                                    }]}>
                                        {user?.birthPlace || "Not Added"}
                                    </Text>
                                </View>
                                {(user?.birthLatitude && user?.birthLongitude)? (
                                    <>
                                        <View style ={[styles.divider,
                                    {
                                        backgroundColor: colors.border
                                    }
                                ]}/>
                                <View style = {[styles.infoRow,
                                    {
                                        paddingVertical: spacing.lg
                                    }
                                ]}>
                                    <Text style ={[styles.infoLabel, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.medium,
                                        color: colors.textSub
                                    }]}>
                                        Coordinates
                                    </Text>
                                     <Text style ={[styles.infoValue, {
                                        fontSize: typography.sizes.body,
                                        fontWeight: typography.weights.semiBold,
                                        color: colors.textMain
                                    }]}>
                                        {user.birthLatitude.toFixed(4)}°N, {user.birthLongitude.toFixed(4)}°E
                                    </Text>
                                </View>
                                    </>
                                ) : null}
                        </View>

                        <TouchableOpacity
                         activeOpacity={0.8}
                         style ={[styles.editBtn,
                            {
                                backgroundColor:colors.primary,
                                marginTop: spacing.giant,
                                borderRadius: borderRadius.md,
                                ...shadows.primaryGlow
                            }
                         ]}
                         onPress={handleStartEdit}
                         >
                            <Ionicons name = "create-outline" size={20} color= {colors.white}/>
                            <Text style = {[styles.editBtnText,
                                {
                                    fontSize: typography.sizes.large,
                                    fontWeight:typography.weights.bold,
                                    color: colors.white
                                }
                            ]}>
                                Edit Profile
                            </Text>
                         </TouchableOpacity>
                         </View>
                    

                    ):
                    (
                        //  Edit mode container 
                        <View style ={[styles.infoSection,
                            {
                                paddingHorizontal: spacing.xxl,
                                paddingTop: spacing.lg
                            }
                        ]}>
                            <Text style ={[styles.sectionHeader,{
                                fontSize: typography.sizes.large,
                                fontWeight: typography.weights.bold,
                                color: colors.primaryDark,
                                marginTop:spacing.lg,
                                marginBottom: spacing.sm
                            }]}>
                                Edit Details
                            </Text>

                            {/* Name input */}
                            <Text style ={[styles.inputLabel,
                                {fontSize:typography.sizes.body,
                                    fontWeight:typography.weights.semiBold,
                                    color: color.textSub,
                                    marginTop: spacing.lg,
                                    marginBottom:spacing.xs
                                }
                            ]}>
                                Full Name
                            </Text>
                            <View style ={[styles.inputContainer,
                                {backgroundColor:colors.card,
                                    borderColor: colors.border,
                                    borderRadius:borderRadius.md
                                }
                            ]}>
                                <TextInput 
                                style ={[styles.textInput,
                                    {
                                        fontSize: typography.sizes.body,
                                        color:colors.textMain
                                    }
                                ]}
                                value ={fullName}
                                onChangeText ={setFullName}
                                placeHolder = "Enter full name"
                                placeholderTextColor={colors.textMuted}
                                />
                            </View>

                             {/* Phone input */}
                            <Text style ={[styles.inputLabel,
                                {fontSize:typography.sizes.body,
                                    fontWeight:typography.weights.semiBold,
                                    color: color.textSub,
                                    marginTop: spacing.lg,
                                    marginBottom:spacing.xs
                                }
                            ]}>
                                Phone Number
                            </Text>
                            <View style ={[styles.inputContainer,
                                {backgroundColor:colors.card,
                                    borderColor: colors.border,
                                    borderRadius:borderRadius.md
                                }
                            ]}>
                                <TextInput 
                                style ={[styles.textInput,
                                    {
                                        fontSize: typography.sizes.body,
                                        color:colors.textMain
                                    }
                                ]}
                                value ={phone}
                                onChangeText ={setPhone}
                                placeHolder = "Enter phone number"
                                keyboardType="phone-pad"
                                placeholderTextColor={colors.textMuted}
                                />
                            </View>

                             {/* gender input */}
                            <Text style ={[styles.inputLabel,
                                {fontSize:typography.sizes.body,
                                    fontWeight:typography.weights.semiBold,
                                    color: color.textSub,
                                    marginTop: spacing.lg,
                                    marginBottom:spacing.xs
                                }
                            ]}>
                                Gender
                            </Text>
                            <View style ={styles.genderOptions}>
                                {["Male", "Female", "Other"].map((g)=>{
                                    const isSelected = gender === g;
                                    return (
                                        <TouchableOpacity 
                                        key = {g}
                                        activeOpacity = {0.8}
                                        style={
                                            [
                                                styles.genderBtn,
                                                {
                                                    backgroundColor:colors.card,
                                                    borderColor:colors.border,
                                                    borderRadius: borderRadius.sm
                                                },
                                                isSelected && {borderColor: colors.primary,
                                                    backgroundCOlor: colors.primaryLight
                                                }
                                            ]
                                        }
                                        onPress={()=>setGender(g)}
                                        >
                                            <Text style ={[styles.genderBtnText,
                                                {
                                                    fontSize: typography.sizes.body,
                                                    fontWeight:typography.weights.semiBold,
                                                    color:colors.textSub
                                                },

                                                isSelected && {
                                                    color: colors.primary,

                                                }
                                               
                                            ]}
                                            >
                                                {g}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>

                             {/* DOB picker card */}
                                  <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold,                   color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                                    Date of Birth
                                  </Text>
                                  <TouchableOpacity
                                    activeOpacity={0.8}
                  style={[styles.pickerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius:                   borderRadius.md }]}
                                    onPress={() => setShowDatePicker(true)}
                >
                                    <Text style={[styles.pickerCardText, { fontSize: typography.sizes.body, color: colors.textMain,                   fontWeight: typography.weights.medium }]}>
                                      {dateOfBirth.toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                  </TouchableOpacity>

                                  {showDatePicker && (
                                    <DateTimePicker
                                      value={dateOfBirth}
                                      mode="date"
                                      display="default"
                                      maximumDate={new Date()}
                                      onChange={handleDateChange}
                                    />
                                  )}

                        {/* Time picker card */}
                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Time of Birth
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.pickerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.pickerCardText, { fontSize: typography.sizes.body, color: colors.textMain, fontWeight: typography.weights.medium }]}>
                    {birthTime}
                  </Text>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}

                     {/* Autocomplete Birth Place */}
                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Birth Place
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md },
                    searchFocused && { borderColor: colors.primary },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { fontSize: typography.sizes.body, color: colors.textMain }]}
                    value={birthPlace}
                    onChangeText={handlePlaceSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search city..."
                    placeholderTextColor={colors.textMuted}
                  />
                  {loadingPlaces && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {places.length > 0 && (
                  <View style={[styles.suggestionsBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                    {places.map((place) => (
                      <TouchableOpacity
                        key={place.place_id}
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectPlace(place)}
                      >
                        <Ionicons name="location-outline" size={18} color={colors.primary} />
                        <Text numberOfLines={1} style={[styles.suggestionItemText, { fontSize: typography.sizes.body, color: colors.textMain }]}>
                          {place.display_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Autocomplete Birth Place */}
                <Text style={[styles.inputLabel, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                  Birth Place
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md },
                    searchFocused && { borderColor: colors.primary },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { fontSize: typography.sizes.body, color: colors.textMain }]}
                    value={birthPlace}
                    onChangeText={handlePlaceSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search city..."
                    placeholderTextColor={colors.textMuted}
                  />
                  {loadingPlaces && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {places.length > 0 && (
                  <View style={[styles.suggestionsBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}>
                    {places.map((place) => (
                      <TouchableOpacity
                        key={place.place_id}
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectPlace(place)}
                      >
                        <Ionicons name="location-outline" size={18} color={colors.primary} />
                        <Text numberOfLines={1} style={[styles.suggestionItemText, { fontSize: typography.sizes.body, color: colors.textMain }]}>
                          {place.display_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                       {/* Action Buttons */}
                <View style={[styles.actionBtnRow, { marginTop: spacing.giant }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.actionBtn, styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: borderRadius.md }]}
                    onPress={handleCancel}
                    disabled={loading}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textSub, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.actionBtn, styles.saveBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md, ...shadows.primaryGlow }]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={[styles.saveBtnText, { color: colors.white, fontSize: typography.sizes.large, fontWeight: typography.weights.bold }]}>
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </CosmicBackground>
    )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {},
  scrollContent: {},
  avatarSection: {
    alignItems: "center",
    borderBottomWidth: 1,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    marginBottom: 8,
  },
  profileName: {},
  profileEmail: {},
  infoSection: {},
  sectionHeader: {},
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    textAlign: "right",
    flex: 1.5,
  },
  wrapText: {
    lineHeight: 18,
  },
  notAddedText: {},
  divider: {
    height: 1,
  },
  editBtn: {
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: {
    marginLeft: 8,
  },
  inputLabel: {},
  inputContainer: {
    borderWidth: 1.5,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderBtn: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  genderBtnText: {},
  pickerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    height: 50,
    paddingHorizontal: 16,
  },
  pickerCardText: {},
  suggestionsBox: {
    borderWidth: 1,
    marginTop: 4,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionItemText: {
    marginLeft: 10,
    flex: 1,
  },
  actionBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  cancelBtnText: {},
  saveBtn: {},
  saveBtnText: {},
});
