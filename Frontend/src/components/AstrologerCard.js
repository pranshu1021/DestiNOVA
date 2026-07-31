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
      name,specialty,experience,rating,price,image,isOnline=false,onPress
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
            {image ? (
               <Image source={{uri:image}} style={[styles.avatar,{borderColor:colors.primaryLight}]}/>
            ):(
               <View style = {[styles.avatarPlaceholder, {backgroundColor: colors.primaryLight, 
                  borderColor: colors.primary
               }]}>
                  <Ionicons name ="person" size = {28} color = {colors.primary}/>
                  </View>
            )}
            {isOnline && <View style = {[styles.onlineBadge, {backgroundColor: colors.success, borderColor:colors.card}]}/>}
               </View>

               <View style = {[styles.infoContainer, {marginLeft : spacing.lg}]}>
                  <Text numberOfLines={1} style= {[styles.nameText, {fontSze:typography.sizes.large,fontWeight:
                     typography.weights.bold, 
                     color:colors.textMain 
                  }]}>
                     {name}
                  </Text>
                  <Text numberOfLines={1} style = {[styles.specialtyText, {fontSize: typography.sizes.body,
                     color: colors.textSub
                  }]}>
                     {specialty}
                  </Text>

                  <View style = {[styles.metricItem]}>
                     <Ionicons name ="star" size={13} color ="#FBBF24" />
                     <Text style={[styles.metricText,{
                        fontSize:typography.sizes.small,
                        color:colors.textSub,
                        fontWeight:weights.medium
                     }]}>
                        {rating}
                     </Text>

                     <View style= {[styles.metricDivider, {
                        backgroundColor: colors.textMuted, 
                        marginHorizontal:spacing.sm
                     }]}>
                        <Text style = {[styles.metricText , {fontSize: typography.sizes.small,
                           color:colors.textSub,fontWeight: typography.weights.medium
                        }]}>
                           {experience} yrs exp
                        </Text>
                     </View>
                  </View>
               </View>

               
               <View style ={[styles.pricingContainer, {
                  marginLeft: spacing.md
               }]}>
                  <Text style = {[styles.priceText, {
                     fontSize:typography.sizes.large,
                     fontWeight: typography.weights.bold,
                     color:colors.primary,
                     marginBottom: spacing.sm
                  }]}>
                     ${price}/min
                  </Text>
                  <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.chatButton,
                     {
                        backgroundColor:colors.primary,
                        borderRadius: borderRadius.sm
                     }
                  ]}
                  onPress= {onPress}
                  >
                     <Text style = {[styles.chatButtonText, {
                        color:colors.white,
                        fontSize: typography.sizes.small,
                        fontWeight: typography.weights.bold
                     }]}>
                        Chat
                     </Text>
                  </TouchableOpacity>
               </View>
               </TouchableOpacity>
         );
      }

const styles = StyleSheet.create({
   card: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth:1.5
      ,
   }
   ,
   imageContainer:{
      position: "relative",

   }
   ,
   imageContainer:{
      position:"relative",
   }
   ,
   avatar:{

      width: 70,
      height:60,
      borderRadius:30,
      borderWidth: 1.5,

   },
   avatarPlaceholder:{
      width:60,
      height:60,
      bordeRadius:30,
      justifyContent:"center",
      alignItems:"center",
      borderWidth:1.5,

   },
   onlineBadge:{
      position:"absolute",
      bottom:0,
      right:2,
      width: 14,
      height:14,
      borderRadius:7,
      borderWidth: 2,
   },
   infoContainer:{
      flex:1,

   },
   nameText:{},
   specialtyText:{
      marginTop:2,
   },
   metricsRow:{
      flexDirection: "row",
      alignItems:"center",
   },
   metricText:{
      marginLeft:3,
   },
   metricItems:{
      flexDirection:"row",
      alignItems:"center",

   },
   metricDivider:{
      width:4,
      height:4,
      borderRadius:2,

   },
   pricingContainer:{
      alignItems:"flex-end",
   },
   priceText:{},
   chatButton:{
      paddingHorizontal: 16,
      paddingVertical:6,
      justifyContent:"center",
      alignItems:"center",
   },
   chatButtonText:{}
});

        




        
        