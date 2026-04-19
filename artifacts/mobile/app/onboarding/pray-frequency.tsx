import { useApp, type PrayFrequency } from "@/context/AppContext";
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

const OPTIONS: { label: string; value: PrayFrequency }[] = [
  { label: "Not much", value: "Not much" },
  { label: "Often enough", value: "Often enough" },
  { label: "It's been a while", value: "It's been a while" },
  { label: "Daily", value: "Daily" },
];

export default function PrayFrequencyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { prayFrequency, setPrayFrequency } = useApp();
  const [selected, setSelected] = useState<PrayFrequency>(prayFrequency);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSelect = (val: PrayFrequency) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(val);
    setPrayFrequency(val);
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
            3 of 6
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            How often do you pray?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Your honest answer helps us guide you.
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
                onPress={() => router.push("/onboarding/gratitude")}
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
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
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
