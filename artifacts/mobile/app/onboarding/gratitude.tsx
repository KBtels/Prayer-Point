import { useApp, type GratitudeTime } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OPTIONS: { label: string; value: GratitudeTime }[] = [
  { label: "Today", value: "Today" },
  { label: "This week", value: "This week" },
  { label: "A while back", value: "A while back" },
  { label: "Over a month ago", value: "Over a month ago" },
];

export default function GratitudeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { gratitudeTime, setGratitudeTime } = useApp();
  const [selected, setSelected] = useState<GratitudeTime>(gratitudeTime);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSelect = (val: GratitudeTime) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(val);
    setGratitudeTime(val);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topInset + 32,
          paddingBottom: bottomInset + 24,
        },
      ]}
    >
      <View style={styles.inner}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={[styles.step, { color: colors.mutedForeground }]}>
            4 of 6
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            When did you last give thanks?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Gratitude opens the door to God's presence.
          </Text>
        </Animated.View>

        <View style={styles.options}>
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === opt.value;
            return (
              <Animated.View
                key={opt.value}
                entering={FadeInDown.duration(500).delay(i * 80 + 150)}
              >
                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleSelect(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optLabel,
                      {
                        color: isSelected
                          ? colors.primaryForeground
                          : colors.foreground,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.footer}>
          {selected !== "" && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/onboarding/prayer-scale")}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28 },
  step: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    fontStyle: "italic",
  },
  options: { marginTop: 40, gap: 14 },
  option: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  optLabel: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
  },
  footer: { marginTop: "auto" as const, paddingTop: 32 },
  btn: {
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
  },
  btnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
