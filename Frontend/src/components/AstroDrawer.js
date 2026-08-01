import React, {useEffect, useState, useContext} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
    Platform,
    ScrollView,
} from "react-native";

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";


const {width:SCREEN_WIDTH} = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78; // yha 78 percent screen width cover krre hai

export default function AstroDrawer({
    isOpen,
    onClose,
    user,
    onViewProfile,
    onPremium,
    onHoroscope,
    onKundli,
    onAIChat,
    onNotifications,
    onHelp,
    onLogout,
}) {
    const {colors, spacing, typography, borderRadius, themeMode, setThemeMode} = useContext(ThemeContext);

    const [shouldRender, setShouldRender] = useState(isOpen);
    const slideAnim = useSharedValue(-DRAWER_WIDTH);
    const opacityAnim = useSharedValue(0);
    const isMounted = React.useRef(true);

    useEffect(()=>{
        isMounted.current = true;
        return() => {
            isMounted.current = false;
        };
    }, []);

    const safeSetShouldRender = (val) =>{
        if(isMounted.current) {
            setShouldRender(val);
        }
    };

    useEffect(()=>{
        if(isOpen){
            setShouldRender(true);
            slideAnim.value = withTiming(0,{duration:250});
            opacityAnim.value = withTiming(0.4, {duration:250});
        } else{
            opacityAnim.value = withTiming(0,{
                duration:220
            });
            slideAnim.value = withTiming(-DRAWER_WIDTH,{duration: 220},(finished)=>{
                if(finished){
                    runOnJS(safeSetShouldRender)(false);
                }
            });
        }
    },[isOpen]);

    const animatedDrawerStyle = useAnimatedStyle(()=>{
        return {
            transform:[{translateX: slideAnim.value}],
        };
    });

    const animatedOverlayStyle = useAnimatedStyle(()=>{
        return {
            opacity: opacityAnim.value,
        };
    });

    if(!shouldRender) return null;

    const menuItems = [
        {label: "My Profile", icon: "person-outline", onPress: onViewProfile},
        {label: "Premium Upgrade", icon: "star-outline", onPress: onPremium, badge:"PRO"},
        {label: "Daily Horoscope", icon: "planet-outline", onPress: onHoroscope},
        {label: "Kundli Matching", icon: "heart-outline", onPress: onKundli},
        {label: "AI Astrology Chat", icon: "chatbubble-outline", onPress: onAIChat},
        {label: "Notifications", icon: "notifications-outline", onPress: onNotifications},
        {label: "Help & Support", icon: "help-circle-outline", onPress: onHelp},
    ];

    return(
        <View style = {StyleSheet.absoluteFill}>
            <TouchableWithoutFeedback onPress = {onClose}>
                <Animated.View style= {[styles.overlay, animatedOverlayStyle]}/>
            </TouchableWithoutFeedback>

            <Animated.View 
            style={[styles.drawerContainer,
                {
                    backgroundColor:colors.card,
                    paddingTop:Platform.OS === "ios" ? 50:30,
                },
                animatedDrawerStyle,
            ]}>
                <View style = {[styles.profileHeader, 
                    {
                        borderBottomColor: colors.border
                    }
                ]}>
                    {user?.photo ? (
                        <Image source= {{uri: user.photo}} style = {[styles.avatar, {
                            borderColor:colors.primary
                        }]}/>
                    ): (
                        <View style = {[styles.avatarPlaceholder,
                            {
                                backgroundColor: colors.primaryLight, borderColor: colors.primary
                            }
                        ]}>
                            <Ionicons name = "person" size ={28} color = {colors.primary} />
                            </View> 


                    )}

                    <Text numberOfLines={1} style ={[styles.userName, {
                        fontSize:typography.sizes.large,
                        fontWeight: typography.weights.bold,
                        color: colors.textMain
                    }]}>
                        {user?.fullName || "Astro Explorer"} 
                    </Text>
                    <Text numberOfLines ={1} style={[
                        styles.userEmail,
                        {
                            fontSize:typography.sizes.body,
                            color:colors.textSub
                        }
                    ]}>
                        {user?.email || ""}
                    </Text>
                </View>

                <ScrollView style = {
                    styles.menuContainer
                } showsVerticalScrollIndicator={false}>
                    {menuItems.map((item,index)=>(
                        <TouchableOpacity
                        key ={index}
                        style = {styles.menuItem}
                        activeOpacity= {0.7}
                        onPress = {() => {
                            onClose();
                            if(item.onPress) item.onPress();
                        }}>
                            <View style = {styles.iconWrapper}>
                                <Ionicons name={item.icon} size={20} color = {colors.textSub}/>
                            </View>
                            <Text style={[styles.menuLabel, {
                                fontSize: typography.sizes.body,
                                fontWeight: typography.weights.semiBold,
                                color: colors.textMain
                            }]}>
                                {item.label}
                            </Text>
                            {item.badge && (
                                <View style = {[styles.badge, {
                                    backgroundColor: colors.primary
                                }]}>
                                    <Text style = {[styles.badgeText, 
                                        {fontWeight: typography.weights.bold,
                                            color: colors.white
                                        }
                                    ]}>
                                        {item.badge}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style = {[styles.bottomContainer,{
                    borderTopColor: colors.border
                }]}>
                    <View style ={styles.themeSelectorSection}>
                        <Text style={[
                            styles.themeTitle,{
                                fontSize: typography.sizes.caption,
                                fontWeight:typography.weights.semiBold,
                                color:colors.textSub
                            }]}>
                                Theme Settings
                                </Text>

                    <View style = {[styles.themeRow,
                        {
                            backgroundColor:colors.background,
                            borderRadius: borderRadius.md
                        }
                    ]}>
                        {["light","dark", "system"].map((mode)=>{
                            const isActive = themeMode === mode;
                            return (
                                <TouchableOpacity
                                key ={mode}
                                activeOpacity={0.8}
                                style={[
                                    styles.themeBtn,
                                    {borderRadius: borderRadius.sm},
                                    isActive && {backgroundColor:
                                        colors.card,
                                        elevation: 2,
                                        shadowColor: "#000" ,
                                        shadowOpacity:0.05,
                                        shadowRadius:3
                                    },
                                ]}
                                onPress = {()=> setThemeMode(mode)}
                                >
                                    <Text 
                                    style={[
                                        styles.themeBtnText,
                                        {fontSize:typography.sizes.small,
                                            fontWeight: typography.weights.medium,
                                            color:colors.textSub
                                        },
                                        isActive && {color: colors.primary,
                                            fontWeight: typography.weights.bold
                                        },
                                    ]}>
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </Text>
                                </TouchableOpacity>

                            );
                        })}
                    </View>
                    </View>

            <TouchableOpacity
            style ={styles.logoutButton}
            activeOpacity={0.7}
            onPress={()=>{
                onClose();
                if(onLogout) onLogout();
            }}>
                <View style ={styles.iconWrapper}>
                    <Ionicons name="log-out-outline" size={20}
                    color={colors.danger}/>

                </View>
                <Text style ={[styles.logoutLabel,
                    {
                        fontSize: typography.sizes.body,
                        fontWeight:typography.weights.bold,
                        color:colors.danger
                    }
                ]}>
                    Logout
                </Text>
            </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor:"#000000"
    },
    drawerContainer:{
        position:"absolute",
        left:0,
        top:0,
        bottom:0,
        width: DRAWER_WIDTH,
        justifyContent:"space-between",

    },
    profileHeader:{
        paddingHorizontal:20,
        paddingBottom:20,
        borderBottomWidth:1,
        alignItems: "flex-start",

    },
    avatar:{
        width: 60,
        height:60,
        borderRadius:30,
        marginBottom: 12,
        borderWidth: 2,

    },
    avatarPlaceholder:{
        width:60,
        height:60,
        borderRadius:30,
        justifyContent:"center",
        alignItems:"center",
        marginBottom:12,
        borderWidth: 2,

    },
    userName:{
        marginBottom:2,

    },
    userEmail:{
        opacity:0.8,
    }
    ,
    menuContainer:{
        flex:1,
        paddingVertical:16,

    },
    menuItem:{
        flexDirection:"row",
        alignItems:"center",
        paddingVertical: 14,
        paddingHorizontal: 20,

    },
    iconWrapper:{
        width: 24,
        alignItems:"center",
        marginRight:12,

    },
    menuLabel:{
        flex:1,

    }
    ,
    badge:{
        paddingHorizontal:6,
        paddingVertical:2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize:9,
    },
    bottomContainer:{
        borderTopWidth: 1,
        paddingVertical:16, 
        paddingBottom: Platform.OS === "ios" ? 30:16,

    },
    themeSelectorSection:{
        paddingHorizontal:20 ,
         marginBottom:16,

    },
    themeTitle:{
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,

    },
    themeRow: {
        flexDirection: "row",
        padding:3,
        justifyContent:"space-between",

    },
    themeBtn:{
        flex:1,
        paddingVertical: 8,
        justifyContent: "center",
        alignItems:"center",

    },
    themeBtnText:{
        textAlign:"center",

    },
    logoutButton:{
        flexDirection:"row",
        alignItems:"center",
        paddingVertical:12,
        paddingHorizontal:20,

    },
 logoutLabel:{
    
 }

})
