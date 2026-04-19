import { VideoBackground } from "@/components/VideoBackground";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const LINES = [
  "The world is busy.",
  "Life is lived fast.",
  "We lose touch with God.",
  "Your journey with God continues here.",
];

export default function IntroScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (step < LINES.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), 2200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowButton(true), 1200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.prayerBg ?? "#0A0A14" },
      ]}
    >
      <VideoBackground
        source={require("@/assets/videos/onboarding-bg.mp4")}
        webUrl="/videos/onboarding-bg.mp4"
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["rgba(10,10,20,0.55)", "rgba(10,10,20,0.7)", "rgba(10,10,20,0.92)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          styles.inner,
          { paddingTop: topInset + 60, paddingBottom: bottomInset + 24 },
        ]}
      >
        <Animated.View entering={FadeIn.duration(1000)} style={styles.topArea}>
          <View style={[styles.cross, { borderColor: colors.goldGlow ?? "#D4A843" }]}>
            <View
              style={[
                styles.crossV,
                { backgroundColor: colors.goldGlow ?? "#D4A843" },
              ]}
            />
            <View
              style={[
                styles.crossH,
                { backgroundColor: colors.goldGlow ?? "#D4A843" },
              ]}
            />
          </View>
        </Animated.View>

        <View style={styles.textArea}>
          {LINES.slice(0, step + 1).map((line, i) => (
            <Animated.Text
              key={i}
              entering={FadeInDown.duration(700).delay(100)}
              style={[
                styles.line,
                {
                  color: i === LINES.length - 1 ? colors.goldGlow ?? "#D4A843" : colors.prayerText ?? "#E8D9B8",
                  fontSize: i === LINES.length - 1 ? 22 : 17,
                  fontWeight: i === LINES.length - 1 ? "600" : "400",
                },
              ]}
            >
              {line}
            </Animated.Text>
          ))}
        </View>

        {showButton && (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.btnArea}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.goldGlow ?? "#D4A843" }]}
              onPress={() => router.replace("/onboarding/name")}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, { color: "#0A0A14" }]}>
                God First
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
  },
  topArea: {
    alignItems: "center",
    marginBottom: 64,
  },
  cross: {
    width: 64,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  crossV: {
    position: "absolute",
    width: 8,
    height: 80,
    borderRadius: 4,
  },
  crossH: {
    position: "absolute",
    width: 56,
    height: 8,
    top: 20,
    borderRadius: 4,
  },
  textArea: {
    flex: 1,
    gap: 20,
  },
  line: {
    fontFamily: "Inter_400Regular",
    lineHeight: 28,
  },
  btnArea: {
    paddingBottom: 16,
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
});
