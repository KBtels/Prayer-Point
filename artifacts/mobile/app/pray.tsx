import RatingModal from "@/components/RatingModal";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { generatePrayer } from "@/constants/prayers";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Family",
  "Marriage",
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
  "Work",
  "Commuting",
  "School work submission",
  "Depression",
  "Joy",
  "Presentation",
  "Relationship",
  "Expectations",
];

type PrayStep = "select" | "breath" | "praying" | "complete";

const BREATH_TRIGGERS = ["Stress", "Anxiety", "Uncertainty", "Depression"];
const BREATH_PHASES: { label: string; duration: number; scale: number }[] = [
  { label: "Breathe in", duration: 4000, scale: 1.5 },
  { label: "Hold", duration: 4000, scale: 1.5 },
  { label: "Breathe out", duration: 6000, scale: 1 },
];
const BREATH_TOTAL_CYCLES = 3;

const { width } = Dimensions.get("window");

export default function PrayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    recordPrayer,
    totalPrayers,
    ratingPrompted,
    appRating,
    setAppRating,
    markRatingPrompted,
  } = useApp();
  const [showRating, setShowRating] = useState(false);
  const [step, setStep] = useState<PrayStep>("select");
  const [selected, setSelected] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [amenReady, setAmenReady] = useState(false);
  const [sessionSeed, setSessionSeed] = useState<number>(() => Date.now());

  const pulse = useSharedValue(1);
  const light = useSharedValue(0);

  // breath step renderer is delegated below; first hook handles transitions
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
      setAmenReady(false);
      light.value = 0;
    } else {
      pulse.value = withTiming(1);
      light.value = 0;
      setAmenReady(false);
    }
  }, [step]);

  const lastTapRef = useRef(0);
  const handleScreenTap = () => {
    if (amenReady) return;
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAmenReady(true);
      light.value = withTiming(1, {
        duration: 1800,
        easing: Easing.inOut(Easing.cubic),
      });
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const lightOverlayStyle = useAnimatedStyle(() => ({
    opacity: light.value,
  }));

  const prayerTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      light.value,
      [0, 1],
      ["#E8D9B8", "#1a1209"],
    ),
  }));

  const breathTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      light.value,
      [0, 1],
      ["rgba(232,217,184,0.55)", "rgba(26,18,9,0.55)"],
    ),
  }));

  const closeIconStyle = useAnimatedStyle(() => ({
    opacity: 1,
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

  const needsBreath = selected.some((c) => BREATH_TRIGGERS.includes(c));

  const handlePray = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSessionSeed(Date.now());
    setStep(needsBreath ? "breath" : "praying");
  };

  const trimmedCustom = customTopic.trim();
  const activeTopics = trimmedCustom ? [trimmedCustom, ...selected] : selected;
  const canPray = activeTopics.length > 0;

  const handleAmen = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    recordPrayer(activeTopics);
    setStep("complete");
    if (!ratingPrompted && appRating === 0 && totalPrayers + 1 === 2) {
      setTimeout(() => setShowRating(true), 900);
    }
  };

  if (step === "breath") {
    return (
      <BreathScreen
        topInset={topInset}
        bottomInset={bottomInset}
        colors={colors}
        onContinue={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setStep("praying");
        }}
        onSkip={() => setStep("praying")}
        onClose={() => router.back()}
      />
    );
  }

  if (step === "praying") {
    const prayerText = generatePrayer({
      category: selected[0] ?? "Gratitude",
      customTopic: trimmedCustom || undefined,
      sessionSeed,
    });
    const isBreathing = false;

    return (
      <View
        style={[
          styles.prayingContainer,
          { backgroundColor: colors.prayerBg ?? "#0A0A14" },
        ]}
      >
        <LinearGradient
          colors={["#0A0A14", "#10101E", "#0A0A14"]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "#FFFFFF" },
            lightOverlayStyle,
          ]}
        />
        <TouchableOpacity
          style={[styles.closeBtn, { top: topInset + 16 }]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="close"
            size={24}
            color={amenReady ? "#1a1209" : colors.prayerText ?? "#E8D9B8"}
          />
        </TouchableOpacity>

        <ScrollView
          style={styles.prayingScroll}
          contentContainerStyle={[
            styles.prayingInner,
            { paddingTop: topInset + 60, paddingBottom: bottomInset + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={handleScreenTap} style={styles.prayingTapArea}>
            <Animated.View style={[styles.glowCircle, pulseStyle, { borderColor: colors.goldGlow + "44" ?? "#D4A84344" }]}>
              <View style={[styles.innerCircle, { backgroundColor: colors.goldGlow + "22" ?? "#D4A84322" }]}>
                <Ionicons name="heart" size={32} color={colors.goldGlow ?? "#D4A843"} />
              </View>
            </Animated.View>

            {isBreathing && (
              <Animated.Text
                entering={FadeIn.duration(800)}
                style={[styles.breathText, breathTextStyle]}
              >
                Breathe slowly...
              </Animated.Text>
            )}

            <View style={styles.categoriesBadges}>
              {activeTopics.map((cat) => (
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

            <Animated.Text style={[styles.prayerText, prayerTextStyle]}>
              {prayerText}
            </Animated.Text>

            {amenReady ? (
              <Animated.View entering={FadeIn.duration(1200)}>
                <TouchableOpacity
                  style={[styles.amenBtn, { borderColor: colors.goldGlow ?? "#D4A843", backgroundColor: colors.goldGlow ?? "#D4A843" }]}
                  onPress={handleAmen}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.amenBtnText, { color: "#FFFFFF" }]}>
                    Amen
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.Text
                entering={FadeIn.duration(800).delay(600)}
                style={[styles.tapHint, { color: colors.prayerText + "77" ?? "#E8D9B877" }]}
              >
                Double-tap when ready to say Amen
              </Animated.Text>
            )}
          </Pressable>
        </ScrollView>
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
        <RatingModal
          visible={showRating}
          title="How was your prayer experience?"
          subtitle="You've prayed twice — we'd love to hear how Prayer Point is helping."
          onClose={() => {
            setShowRating(false);
            markRatingPrompted();
          }}
          onSubmit={(r, rev) => {
            setAppRating(r, rev);
            setShowRating(false);
          }}
        />
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
              {activeTopics[0]}
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
      <ScrollView
        contentContainerStyle={[
          styles.selectContent,
          { paddingBottom: bottomInset + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        <Animated.View
          entering={FadeInDown.duration(400).delay(CATEGORIES.length * 40)}
          style={styles.customWrap}
        >
          <Text style={[styles.customLabel, { color: colors.mutedForeground }]}>
            Or pray about something specific
          </Text>
          <View
            style={[
              styles.customInputRow,
              {
                backgroundColor: colors.card,
                borderColor: trimmedCustom
                  ? colors.primary
                  : colors.border,
              },
            ]}
          >
            <TextInput
              value={customTopic}
              onChangeText={setCustomTopic}
              placeholder="e.g. my interview today"
              placeholderTextColor={colors.mutedForeground}
              maxLength={40}
              style={[styles.customInput, { color: colors.foreground }]}
              returnKeyType="done"
            />
            <Text style={[styles.customCount, { color: colors.mutedForeground }]}>
              {customTopic.length}/40
            </Text>
          </View>
        </Animated.View>

        {canPray && (
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
      </KeyboardAvoidingView>
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
  customWrap: {
    marginTop: 4,
    marginBottom: 24,
  },
  customLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  customInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
  },
  customCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
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
  prayingScroll: {
    flex: 1,
    width: "100%",
  },
  prayingInner: {
    flexGrow: 1,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  prayingTapArea: {
    flex: 1,
    width: "100%",
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
  prayerText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    lineHeight: 32,
    textAlign: "center",
    fontStyle: "italic",
  },
  tapHint: {
    marginTop: 32,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
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

type BreathScreenProps = {
  topInset: number;
  bottomInset: number;
  colors: ReturnType<typeof useColors>;
  onContinue: () => void;
  onSkip: () => void;
  onClose: () => void;
};

function BreathScreen({
  topInset,
  bottomInset,
  colors,
  onContinue,
  onSkip,
  onClose,
}: BreathScreenProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const scale = useSharedValue(1);
  const phase = BREATH_PHASES[phaseIndex];
  const completed = cycle > BREATH_TOTAL_CYCLES;

  useEffect(() => {
    if (completed) return;
    scale.value = withTiming(phase.scale, {
      duration: phase.duration,
      easing: Easing.inOut(Easing.cubic),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const t = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % BREATH_PHASES.length;
      if (nextIndex === 0) setCycle((c) => c + 1);
      setPhaseIndex(nextIndex);
    }, phase.duration);
    return () => clearTimeout(t);
  }, [phaseIndex, cycle, completed]);

  useEffect(() => {
    if (completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [completed]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gold = colors.goldGlow ?? "#D4A843";
  const text = colors.prayerText ?? "#E8D9B8";

  return (
    <View style={[styles.prayingContainer, { backgroundColor: colors.prayerBg ?? "#0A0A14" }]}>
      <LinearGradient
        colors={["#0A0A14", "#10101E", "#0A0A14"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <TouchableOpacity
        style={[styles.closeBtn, { top: topInset + 16 }]}
        onPress={onClose}
      >
        <Ionicons name="close" size={24} color={text} />
      </TouchableOpacity>

      <View
        style={[
          breathStyles.inner,
          { paddingTop: topInset + 60, paddingBottom: bottomInset + 32 },
        ]}
      >
        <Animated.Text
          entering={FadeIn.duration(600)}
          style={[breathStyles.title, { color: text }]}
        >
          Take a moment to breathe
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.duration(600).delay(200)}
          style={[breathStyles.subtitle, { color: text + "88" }]}
        >
          Let your body settle before you bring this to God.
        </Animated.Text>

        <View style={breathStyles.circleWrap}>
          <Animated.View
            style={[
              breathStyles.circleOuter,
              circleStyle,
              { borderColor: gold + "55", backgroundColor: gold + "14" },
            ]}
          />
          <View style={breathStyles.phaseLabelWrap} pointerEvents="none">
            <Text style={[breathStyles.phaseLabel, { color: text }]}>
              {completed ? "Well done" : phase.label}
            </Text>
            {!completed && (
              <Text style={[breathStyles.cycleLabel, { color: text + "77" }]}>
                {cycle} of {BREATH_TOTAL_CYCLES}
              </Text>
            )}
          </View>
        </View>

        <View style={breathStyles.footer}>
          {completed ? (
            <Animated.View entering={FadeIn.duration(500)}>
              <TouchableOpacity
                style={[breathStyles.continueBtn, { backgroundColor: gold }]}
                onPress={onContinue}
                activeOpacity={0.85}
              >
                <Text style={[breathStyles.continueText, { color: "#0A0A14" }]}>
                  Begin Prayer
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity onPress={onSkip} style={breathStyles.skipBtn}>
              <Text style={[breathStyles.skipText, { color: text + "88" }]}>
                Skip to prayer
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const breathStyles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 24,
  },
  circleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  circleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
  },
  phaseLabelWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    fontSize: 22,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  cycleLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    letterSpacing: 1,
  },
  footer: {
    paddingTop: 24,
    width: "100%",
    alignItems: "center",
  },
  continueBtn: {
    paddingHorizontal: 56,
    paddingVertical: 18,
    borderRadius: 50,
  },
  continueText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
