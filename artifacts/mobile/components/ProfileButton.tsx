import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileButtonProps {
  tint?: string;
  borderColor?: string;
}

export function ProfileButton({ tint, borderColor }: ProfileButtonProps) {
  const colors = useColors();
  const { name, profileImage } = useApp();
  const gold = colors.goldGlow ?? "#D4A843";
  const initial = (name || "F").trim().charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      onPress={() => router.push("/profile")}
      activeOpacity={0.8}
      hitSlop={12}
      style={[
        styles.btn,
        {
          borderColor: borderColor ?? gold + "55",
          backgroundColor: tint ?? colors.card,
        },
      ]}
    >
      {profileImage ? (
        <Image
          source={{ uri: profileImage }}
          style={styles.avatar}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: gold + "33", alignItems: "center", justifyContent: "center" }]}>
          <Text style={[styles.initial, { color: gold }]}>{initial}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  initial: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
