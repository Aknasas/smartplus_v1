// app/_layout.tsx
import { Slot } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Layout() {
  return (
    <View style={styles.container}>
      {/* Global Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          SmartHealth+
        </Text>
      </View>

      {/* Dynamic Content */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Global Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 smart+. All Rights Reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Light background color for the app
  },
  header: {
    height: 60,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    height: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});
