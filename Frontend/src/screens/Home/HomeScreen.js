import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  BackHandler,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const { colors, typography, borderRadius, shadows, isDark } = useContext(ThemeContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  useEffect(() => {
    const backAction = () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isDrawerOpen]);


  const dailyHoroscope = {
    signName: "Leo",
    dateRange: "July 23 - Aug 22",
    prediction: "Leo, today the alignment of Mars and Jupiter sparks your creative ambition. Trust your intuition when making key decisions. It's a wonderful day to express your feelings to someone close.",
    luckyColor: "Amber Golden",
    luckyNumber: "9",
    luckyAlphabet: "L",
  };

  const topAstrologers = [
    {
      id: "1",
      name: "Astro Ramesh",
      specialty: "Vedic Astrology, Kundli",
      experience: 12,
      rating: 4.8,
      price: 25,
      isOnline: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Tarot Mamta",
      specialty: "Tarot Cards, Face Reading",
      experience: 8,
      rating: 4.9,
      price: 30,
      isOnline: true,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "Guru Dutt",
      specialty: "Palmistry, Numerology",
      experience: 15,
      rating: 4.7,
      price: 40,
      isOnline: false,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    },
  ];

  const handleFeatureAlert = (featureName) => {
    Alert.alert("DestiNOVA", `${featureName} feature is coming soon!`);
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 18) return "Good Afternoon";
    return "Good Evening";
  };
return (
  <View style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <Text>Hello</Text>
  </View>
);

  // return (
  //   <CosmicBackground>
  //     <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
  //       <StatusBar
  //         barStyle={isDark ? "light-content" : "dark-content"}
  //         backgroundColor={colors.card}
  //       />
        

  //       <Header
  //         user={user}
  //         onLeftPress={() => setIsDrawerOpen(true)}
  //         onRightPress={() => handleFeatureAlert("Notifications")}
  //       />

  //       <ScrollView
  //         showsVerticalScrollIndicator={false}
  //         contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xxxl }]}
  //       >
        
  //         <View style={[styles.welcomeBanner, { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg }]}>
  //           <Text style={[styles.greetingText, { fontSize: typography.sizes.body, color: colors.textSub, fontWeight: typography.weights.medium }]}>
  //             {getGreeting()},
  //           </Text>
  //           <Text style={[styles.userNameText, { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.textMain }]}>
  //             {user?.fullName || "Astro Explorer"}
  //           </Text>
  //         </View>

       
  //         <HomeSection title="Explore Astrology">
  //           <View style={styles.categoryGrid}>
  //             <TouchableOpacity
  //               style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...shadows.soft }]}
  //               activeOpacity={0.7}
  //               onPress={() => handleFeatureAlert("Zodiac Horoscope")}
  //             >
  //               <View style={[styles.categoryIconCircle, { backgroundColor: isDark ? "rgba(124, 90, 237, 0.15)" : "#EEF2FF" }]}>
  //                 <Ionicons name="planet" size={24} color={colors.primary} />
  //               </View>
  //               <Text style={[styles.categoryText, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>
  //                 Horoscope
  //               </Text>
  //             </TouchableOpacity>

  //             <TouchableOpacity
  //               style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...shadows.soft }]}
  //               activeOpacity={0.7}
  //               onPress={() => handleFeatureAlert("Kundli Matcher")}
  //             >
  //               <View style={[styles.categoryIconCircle, { backgroundColor: isDark ? "rgba(139, 92, 246, 0.12)" : "#F5F3FF" }]}>
  //                 <Ionicons name="heart" size={24} color={colors.accent} />
  //               </View>
  //               <Text style={[styles.categoryText, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>
  //                 Kundli
  //               </Text>
  //             </TouchableOpacity>

  //             <TouchableOpacity
  //               style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...shadows.soft }]}
  //               activeOpacity={0.7}
  //               onPress={() => handleFeatureAlert("AI Chatbot")}
  //             >
  //               <View style={[styles.categoryIconCircle, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : "#ECFDF5" }]}>
  //                 <Ionicons name="chatbubble-ellipses" size={24} color={colors.success} />
  //               </View>
  //               <Text style={[styles.categoryText, { fontSize: typography.sizes.body, fontWeight: typography.weights.semiBold, color: colors.textMain }]}>
  //                 AI Chat
  //               </Text>
  //             </TouchableOpacity>
  //           </View>
  //         </HomeSection>

      
  //         <HomeSection title="Today's Horoscope">
  //           <HoroscopeCard {...dailyHoroscope} />
  //         </HomeSection>

  
  //         <View style={[styles.premiumBanner, { backgroundColor: colors.primary, marginHorizontal: spacing.xxl, marginVertical: spacing.lg, padding: spacing.xl, borderRadius: borderRadius.xl, ...shadows.primaryGlow }]}>
  //           <View style={{ marginBottom: spacing.md }}>
  //             <Text style={[styles.premiumTitle, { fontSize: typography.sizes.h3, fontWeight: typography.weights.bold, color: colors.white }]}>
  //               Unlock Cosmic Insights
  //             </Text>
  //             <Text style={[styles.premiumSubtitle, { fontSize: typography.sizes.body, color: isDark ? colors.accent : "#E0E7FF" }]}>
  //               Get unlimited AI chat, complete compatibility matches, and daily custom predictions.
  //             </Text>
  //           </View>
  //           <TouchableOpacity
  //             style={[styles.premiumButton, { backgroundColor: colors.white, borderRadius: borderRadius.md }]}
  //             activeOpacity={0.8}
  //             onPress={() => handleFeatureAlert("Upgrade Plan")}
  //           >
  //             <Text style={[styles.premiumButtonText, { color: colors.primary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }]}>
  //               Upgrade Now
  //             </Text>
  //           </TouchableOpacity>
  //         </View>

       
  //         <HomeSection title="Top Astrologers" actionText="See All" onActionPress={() => handleFeatureAlert("Astrologers List")}>
  //           {topAstrologers.map((astro) => (
  //             <AstrologerCard
  //               key={astro.id}
  //               name={astro.name}
  //               specialty={astro.specialty}
  //               experience={astro.experience}
  //               rating={astro.rating}
  //               price={astro.price}
  //               image={astro.image}
  //               isOnline={astro.isOnline}
  //               onPress={() => handleFeatureAlert(`Chat with ${astro.name}`)}
  //             />
  //           ))}
  //         </HomeSection>
  //       </ScrollView>

        
  //       <AstroDrawer
  //         isOpen={isDrawerOpen}
  //         onClose={() => setIsDrawerOpen(false)}
  //         user={user}
  //         onViewProfile={() => navigation.navigate("Profile")}
  //         onPremium={() => handleFeatureAlert("Premium")}
  //         onHoroscope={() => handleFeatureAlert("Horoscope")}
  //         onKundli={() => handleFeatureAlert("Kundli Matching")}
  //         onAIChat={() => handleFeatureAlert("AI Chat")}
  //         onNotifications={() => handleFeatureAlert("Notifications")}
  //         onHelp={() => handleFeatureAlert("Help Center")}
  //         onLogout={logout}
  //       />
  //     </SafeAreaView>
  //   </CosmicBackground>
  // );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  scrollContent: {},
  welcomeBanner: {
    paddingBottom: spacing.xs,
  },
  greetingText: {
    opacity: 0.8,
  },
  userNameText: {
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginHorizontal: spacing.xs,
    borderWidth: 1,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryText: {},
  premiumBanner: {},
  premiumTitle: {},
  premiumSubtitle: {
    lineHeight: 18,
    marginTop: 4,
  },
  premiumButton: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  premiumButtonText: {},
});
