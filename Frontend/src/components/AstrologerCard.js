import React ,{useContext} from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet,
Text,
View ,
TouchableOpacity,
Image,
} from 'react-native';
import {ThemeContext} from "../context/ThemeContext"


   export default function AstrologerCard({
      name,speciality,experience,rating,price,image,isOnline=false,onPress
   }){
      const {colors,typography,spacing,borderRadius,shadows} = useContext(ThemeContext)
         return (
            <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.card,
               {
                  backgroundColor:colors.card,
                  borderColor:colors.cardBorder,
                  borderRadius:borderRadius.lg,
                  padding:spacing.md,
                  marginBorder:spacing.md,
                  ...shadows.soft

               }
            ]}
            onPress={onPress}

            >
               <View style={styles.imageContainer}>
            {image ? (<Image source={{uri:image}} style={[styles.avatar,{borderColor:colors.primaryLight}]}/>}
               </View>
         )

        




        
        