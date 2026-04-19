import { useApp } from "@/context/AppContext";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootIndex() {
  const { isLoaded, hasOnboarded } = useApp();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FBF7F0" }}>
        <ActivityIndicator color="#C8922A" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding/intro" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
