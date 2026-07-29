import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import CosmicBackground from "./CosmicBackground";

export default function OnboardingLayout({
  children,
 
  onBack,
  currentStep,
  totalSteps = 5,
  iconName,
  title,
  subtitle,
  
  isScrollable = false,
 
  onContinue,
  continueDisabled = false,
  continueLoading = false,
  continueText = "Next",
  onSkip,
  skipText = "Skip for now",
}) {
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const progressPercent = `${(currentStep / totalSteps) * 100}%`;

  const renderHeader = () => (
    <View style={styles.headerContainer}>

      {onBack && (
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card, ...shadows.soft }]}
          activeOpacity={0.7}
          onPress={onBack}
          disabled={continueLoading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.stepInfoRow}>
          <Text style={[styles.stepText, { fontSize: typography.sizes.small, color: colors.textSub, fontWeight: typography.weights.semiBold }]}>
            Step {currentStep} of {totalSteps}
          </Text>
          {onSkip && !continueLoading && (
            <TouchableOpacity activeOpacity={0.7} onPress={onSkip}>
              <Text style={[styles.skipLinkText, { fontSize: typography.sizes.body, color: colors.textSub, fontWeight: typography.weights.semiBold }]}>
                {skipText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.progressBackground, { backgroundColor: colors.border, borderRadius: borderRadius.sm }]}>
          <View style={[styles.progressFill, { width: progressPercent, backgroundColor: colors.primary, borderRadius: borderRadius.sm }]} />
        </View>
      </View>


      {iconName && (
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight, ...shadows.soft }]}>
          <Ionicons name={iconName} size={48} color={colors.primary} />
        </View>
      )}

    
      {title && <Text style={[styles.title, { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.textMain }]}>{title}</Text>}
      {subtitle && <Text style={[styles.subtitle, { fontSize: typography.sizes.body, color: colors.textSub }]}>{subtitle}</Text>}
    </View>
  );

  // Render Footer block
  const renderFooter = () => (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: colors.primary, borderRadius: borderRadius.lg, ...shadows.primaryGlow },
          (continueDisabled || continueLoading) && { backgroundColor: colors.primaryLight + "BF" },
        ]}
        activeOpacity={0.8}
        disabled={continueDisabled || continueLoading}
        onPress={onContinue}
      >
        {continueLoading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Text style={[styles.continueText, { fontSize: typography.sizes.large, fontWeight: typography.weights.bold, color: colors.white }]}>
              {continueText}
            </Text>
            <Ionicons
              name={currentStep === totalSteps ? "checkmark" : "arrow-forward"}
              size={18}
              color={colors.white}
              style={styles.continueIcon}
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const containerStyle = {
    flex: 1,
    backgroundColor: "transparent",
  };

  // Layout wrapper based on scrollable requirement
  const renderLayoutContent = () => {
    if (isScrollable) {
      return (
        <KeyboardAvoidingView
          style={styles.flexContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mainContent}>
              {renderHeader()}
              <View style={styles.body}>{children}</View>
            </View>
            {renderFooter()}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    return (
      <View style={styles.flexContainer}>
        <View style={styles.mainContent}>
          {renderHeader()}
          <View style={styles.bodyResponsive}>{children}</View>
        </View>
        {renderFooter()}
      </View>
    );
  };

  return (
    <CosmicBackground>
      <SafeAreaView style={containerStyle} edges={["top", "left", "right"]}>
        {renderLayoutContent()}
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  body: {
    flex: 1,
    marginTop: 10,
  },
  bodyResponsive: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 10,
  },
  headerContainer: {
    marginTop: Platform.OS === "ios" ? 10 : 20,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    width: "100%",
    marginTop: 15,
  },
  stepInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepText: {
    letterSpacing: 0.5,
  },
  skipLinkText: {},
  progressBackground: {
    width: "100%",
    height: 6,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    marginTop: 18,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 15,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  continueButton: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {},
  continueIcon: {
    marginLeft: 6,
  },
});
