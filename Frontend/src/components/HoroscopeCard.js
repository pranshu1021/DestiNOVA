import React, {useContext } from "react";
import {View, Text, StyleSheet} from "react-native";
import {ThemeContext} from "../context/ThemeContext";

export default function HoroscopeCard({
 signName,
 dateRange ,
 prediction,
 luckyColor,
 luckyNumber,
 luckyAlphabet
}){
 const { colors, spacing, typography, borderRadius, shadows} = useContext(ThemeContext);
 return (
    <View style={[
        styles.card,
        {

            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            ...shadows.soft,

        }
    ]}>
        <View style = {[styles.headerRow, {
            marginBottom : spacing.md
        }]}>
        <View>
            <Text style ={[styles.signTitle,
                {
                    fontSize: typography.sizes.h2, 
                    fontWeight: typography.weights.bold,
                    color: colors.primary
                }

            ]}>
                {signName}
            </Text>
            {
                dateRange && <Text style ={[styles.dateRangeText, {
                    fontSize: typography.weights.bold,
                    color: colors.primary
                }]}>
                    {dateRange}
                   
                    </Text>
            }
        </View>
        <Text style ={styles.zodiacEmoji}>✨</Text>
            </View>
    
    <Text style = {[styles.predictionText, {
        fontSize: typography.sizes.body,
        color: colors.textMain,
        lineHeight: 22,
        marginBottom: spacing.xl
    }]}>
        {prediction} 
    </Text>

    <View style = {[
        styles.attributesGrid,
        {
            backgroundColor:colors.background,
            borderColor:colors.border,
            borderRadius:borderRadius.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
        }
    ]}>
        <View style ={styles.attributesItem}>
            <Text style = {[styles.attributeLabel, {
                fontSize: typography.sizes.caption, 
                fontWeight:typography.weights.medium, color: colors.textSub
            }]}>
                Lucky Color
            </Text>
            <Text style = {[styles.attributeView, {
                fontSize: typography.sizes.large, 
                fontWeight:typography.weights.bold, color: colors.primary
            }]}>
                {luckyColor}
            </Text>
        </View>

        <View style = {[styles.attributeDivider, {
            backgroundColor: colors.border
        }]}/>

        <View style= {styles.attributeItem}>
            <Text style = {[styles.attributeLabel, {
                fontSize: typography.sizes.caption, 
                fontWeight:typography.weights.medium, color: colors.textSub
            }]}>
                Lucky Number
            </Text>
            <Text style = {[styles.attributeView, {
                fontSize: typography.sizes.large, 
                fontWeight:typography.weights.bold, color: colors.primary
            }]}>
                {luckyNumber}
            </Text>
        </View>
        
         <View style = {[styles.attributeDivider, {
            backgroundColor: colors.border
        }]}/>

                <View style= {styles.attributeItem}>
            <Text style = {[styles.attributeLabel, {
                fontSize: typography.sizes.caption, 
                fontWeight:typography.weights.medium, color: colors.textSub
            }]}>
                Lucky Letter
            </Text>
            <Text style = {[styles.attributeView, {
                fontSize: typography.sizes.large, 
                fontWeight:typography.weights.bold, color: colors.primary
            }]}>
                {luckyAlphabet}
            </Text>
        </View>
    </View>
    
    </View>

        
 )
}
const styles = StyleSheet.create({
    card:{
        borderWidth: 1.5,

    },
    headerRow:{
        flexDirection: "row",
        justifyContent:"space-between",
        alignItems:"center",

    },
    signTitle:{

    },
    dateRangeText:{
       marginTop: 2,

    },
    zodiacEmoji:{
        fontSize: 28,

    },
    predictionText: {

    },
    attributesGrid:{
        textTransform:"uppercase",
        marginBottom:4,
        letterSpacing:0.25,
    },
    attributeValue:{

    },
    attributeDivider:
    {
        width: 1.5,
        height:24,
    }


})