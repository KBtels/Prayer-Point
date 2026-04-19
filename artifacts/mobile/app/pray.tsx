import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Beginner",
  "Enlightenment",
  "Gratitude",
  "Peace",
  "Stress",
  "Anxiety",
  "Uncertainty",
  "Test results",
  "School day",
  "New week",
  "Long trip",
];

const PRAYERS: Record<string, string> = {
  Beginner:
    "Lord, I come before You humbly. I am still learning to speak with You. Teach me to know You more, to trust in Your love, and to lean on You through every step of this journey. Amen.",
  Enlightenment:
    "Father, open the eyes of my heart. Let Your truth illuminate every dark corner of my understanding. Fill me with wisdom that comes from You alone. Amen.",
  Gratitude:
    "Lord, thank You. For life, for breath, for grace that never runs out. My heart overflows with gratitude for who You are and what You do. Amen.",
  Peace:
    "Prince of Peace, still the storms within me. Let Your presence be my calm in every chaos. I rest in You. Amen.",
  Stress:
    "Lord, I bring You this burden. I cannot carry it alone. Take it from me and replace my worry with Your peace that passes all understanding. Amen.",
  Anxiety:
    "Father, I am anxious. My heart races. But I know You are near. Help me breathe, help me trust, help me rest in Your perfect love that casts out all fear. Amen.",
  Uncertainty:
    "God, I do not know what lies ahead. But You do. Lead me step by step, and help me trust Your plan even when I cannot see it. Amen.",
  "Test results":
    "Lord, I await an outcome that is in Your hands. Whatever the result, remind me that my worth is found in You, not in any score or verdict. Amen.",
  "School day":
    "Father, as I begin this day of learning, sharpen my mind, steady my focus, and remind me that all wisdom flows from You. Amen.",
  "New week":
    "Lord, a new week stretches before me. Help me to honor You in every task, every conversation, and every quiet moment. Amen.",
  "Long trip":
    "Heavenly Father, I entrust this journey to You. Be my guide on the road, my peace in every mile, and my rest at journey's end. Amen.",
};

type PrayStep = "select" | "praying" | "complete";

const { width } = Dimensions.get("window");

export default function PrayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordPrayer } = useApp();
  const [step, setStep] = useState<PrayStep>("select");
  const [selected, setSelected] = useState<string[]>([]);

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (step === "praying") {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [step]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleCategory = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(cat)) {
      setSelected((s) => s.filter((c) => c !== cat));
    } else if (selected.length < 3) {
      setSelected((s) => [...s, cat]);
    }
  };

  const handlePray = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("praying");
  };

  const handleAmen = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    recordPrayer();
    setStep("complete");
  };

  if (step === "praying") {
    const prayerText =
      PRAYERS[selected[0]] ||
      "Lord, I come before You in faith. Hear my heart. Guide my steps. May Your will be done. Amen.";
    const isBreathing =
      selected.includes("Stress") || selected.includes("Anxiety");

    return (
      <View
        style={[
          styles.prayingContainer,
          { backgroundColor: colors.prayerBg ?? "#0A0A14" },
        ]}
      >
        <TouchableOpacity
          style={[styles.closeBtn, { top: topInset + 16 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={colors.prayerText ?? "#E8D9B8"} />
        </TouchableOpacity>

        <Animated.View style={[styles.prayingInner, { paddingTop: topInset + 60, paddingBottom: bottomInset + 40 }]}>
          <Animated.View style={[styles.glowCircle, pulseStyle, { borderColor: colors.goldGlow + "44" ?? "#D4A84344" }]}>
            <View style={[styles.innerCircle, { backgroundColor: colors.goldGlow + "22" ?? "#D4A84322" }]}>
              <Ionicons name="heart" size={32} color={colors.goldGlow ?? "#D4A843"} />
            </View>
          </Animated.View>

          {isBreathing && (
            <Animated.Text
              entering={FadeIn.duration(800)}
              style={[styles.breathText, { color: colors.prayerText + "88" ?? "#E8D9B888" }]}
            >
              Breathe slowly...
            </Animated.Text>
          )}

          <View style={styles.categoriesBadges}>
            {selected.map((cat) => (
              <View
                key={cat}
                style={[styles.badge, { backgroundColor: colors.goldGlow + "22" ?? "#D4A84322" }]}
              >
                <Text style={[styles.badgeText, { color: colors.goldGlow ?? "#D4A843" }]}>
                  {cat}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView style={styles.prayerScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.prayerText, { color: colors.prayerText ?? "#E8D9B8" }]}>
              {prayerText}
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.amenBtn, { borderColor: colors.goldGlow ?? "#D4A843" }]}
            onPress={handleAmen}
            activeOpacity={0.8}
          >
            <Text style={[styles.amenBtnText, { color: colors.goldGlow ?? "#D4A843" }]}>
              Amen
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (step === "complete") {
    return (
      <View
        style={[
          styles.prayingContainer,
          { backgroundColor: colors.prayerBg ?? "#0A0A14" },
        ]}
      >
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[
            styles.completeInner,
            { paddingTop: topInset + 80, paddingBottom: bottomInset + 40 },
          ]}
        >
          <Ionicons name="checkmark-circle" size={72} color={colors.goldGlow ?? "#D4A843"} />
          <Text style={[styles.completeTitle, { color: colors.prayerText ?? "#E8D9B8" }]}>
            Prayer received.
          </Text>
          <Text style={[styles.completeSubtitle, { color: colors.prayerText + "88" ?? "#E8D9B888" }]}>
            You've connected with God about{"\n"}
            <Text style={{ color: colors.goldGlow ?? "#D4A843", fontFamily: "Inter_600SemiBold" }}>
              {selected[0]}
            </Text>
            .
          </Text>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.goldGlow ?? "#D4A843" }]}
            onPress={() => {
              router.replace("/(tabs)/home");
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.doneBtnText, { color: "#0A0A14" }]}>
              Back Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reflectLink}
            onPress={() => router.replace("/reflect")}
          >
            <Text style={[styles.reflectLinkText, { color: colors.prayerText + "AA" ?? "#E8D9B8AA" }]}>
              Write a reflection
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 16,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Quick Prayer
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.selectContent,
          { paddingBottom: bottomInset + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={[styles.selectHint, { color: colors.mutedForeground }]}
        >
          What do you want to pray about? (up to 3)
        </Animated.Text>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat, i) => {
            const isSelected = selected.includes(cat);
            return (
              <Animated.View
                key={cat}
                entering={FadeInDown.duration(400).delay(i * 40)}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: isSelected
                          ? colors.primaryForeground
                          : colors.foreground,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {selected.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <TouchableOpacity
              style={[styles.prayNowBtn, { backgroundColor: colors.primary }]}
              onPress={handlePray}
              activeOpacity={0.85}
            >
              <Ionicons name="heart" size={20} color={colors.primaryForeground} />
              <Text
                style={[
                  styles.prayNowBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Let's Pray
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  selectContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  selectHint: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
    lineHeight: 22,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 32,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  prayNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
    borderRadius: 20,
  },
  prayNowBtnText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  prayingContainer: {
    flex: 1,
  },
  closeBtn: {
    position: "absolute",
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  prayingInner: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  glowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  breathText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginBottom: 16,
  },
  categoriesBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 32,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  prayerScroll: {
    flex: 1,
    width: "100%",
  },
  prayerText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    lineHeight: 32,
    textAlign: "center",
    fontStyle: "italic",
  },
  amenBtn: {
    marginTop: 32,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  amenBtnText: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  completeInner: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  completeTitle: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    marginTop: 24,
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  doneBtn: {
    paddingVertical: 18,
    paddingHorizontal: 56,
    borderRadius: 50,
    marginBottom: 20,
  },
  doneBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  reflectLink: {
    padding: 12,
  },
  reflectLinkText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
