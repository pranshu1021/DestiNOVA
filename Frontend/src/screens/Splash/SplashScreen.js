import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timeoutId = setTimeout(onFinish, 1000);
    return () => clearTimeout(timeoutId);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DestiNOVA</Text>
      <Text style={styles.subtitle}>Discover your cosmic path</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0018",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: "#D8C7FF",
    fontSize: 16,
    marginTop: 8,
  },
});
