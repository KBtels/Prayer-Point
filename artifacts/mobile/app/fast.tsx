import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DURATIONS = [
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "60 min", minutes: 60 },
];

const SCRIPTURES = [
  { text: '"Be still, and know that I am God."', ref: "Psalm 46:10" },
  { text: '"In quietness and trust is your strength."', ref: "Isaiah 30:15" },
  { text: '"He leads me beside still waters."', ref: "Psalm 23:2" },
  { text: '"Come to me, all you who are weary, and I will give you rest."', ref: "Matthew 11:28" },
  { text: '"Cast all your anxiety on him because he cares for you."', ref: "1 Peter 5:7" },
  { text: '"You will keep in perfect peace those whose minds are steadfast."', ref: "Isaiah 26:3" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function FastScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordFastCompleted, totalFastMinutes, fastsCompleted } = useApp();
  const gold = colors.goldGlow ?? "#D4A843";

  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [scriptureIdx, setScriptureIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startedAtRef = useRef<number>(0);

  // Pulsing breath ring
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (selectedMinutes && !completed) {
      pulse.value = withRepeat(
        withTiming(1.12, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [selectedMinutes, completed]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // Countdown
  useEffect(() => {
    if (!selectedMinutes || completed) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          handleCompleted();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [selectedMinutes, completed]);

  // Rotate scripture every 30s during fast
  useEffect(() => {
    if (!selectedMinutes || completed) return;
    const id = setInterval(() => {
      setScriptureIdx((i) => (i + 1) % SCRIPTURES.length);
    }, 30000);
    return () => clearInterval(id);
  }, [selectedMinutes, completed]);

  function handleStart(minutes: number) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startedAtRef.current = Date.now();
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setScriptureIdx(Math.floor(Math.random() * SCRIPTURES.length));
  }

  function handleCompleted() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompleted(true);
    const minutes = selectedMinutes ?? 0;
    recordFastCompleted(minutes);
  }

  function handleEndEarly() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "End your fast?",
      "Stay just one more minute. He's still here.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "End anyway",
          style: "destructive",
          onPress: () => {
            const elapsedMin = Math.max(
              0,
              Math.floor((Date.now() - startedAtRef.current) / 60000)
            );
            if (elapsedMin > 0) recordFastCompleted(elapsedMin);
            router.back();
          },
        },
      ]
    );
  }

  const scripture = SCRIPTURES[scriptureIdx];
  const totalSeconds = (selectedMinutes ?? 0) * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  // ---------- Picker (no fast started yet) ----------
  if (!selectedMinutes) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Phone Fast
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.pickerContent}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={[styles.pickerKicker, { color: colors.primary }]}>
              UNPLUG · BE STILL · PRAY
            </Text>
            <Text style={[styles.pickerTitle, { color: colors.foreground }]}>
              How long do you want to fast from your phone?
            </Text>
            <Text style={[styles.pickerSub, { color: colors.mutedForeground }]}>
              Prayer Point will hold space for you. Scripture, breath, and a
              gentle countdown — nothing else.
            </Text>
          </Animated.View>

          <View style={styles.durationsCol}>
            {DURATIONS.map((d, i) => (
              <Animated.View
                key={d.minutes}
                entering={FadeInDown.duration(400).delay(120 + i * 80)}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleStart(d.minutes)}
                  style={[
                    styles.durationBtn,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="leaf-outline" size={22} color={gold} />
                  <Text style={[styles.durationLabel, { color: colors.foreground }]}>
                    {d.label}
                  </Text>
                  <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {(totalFastMinutes > 0 || fastsCompleted > 0) && (
            <Animated.View
              entering={FadeInDown.duration(400).delay(500)}
              style={[
                styles.statsBar,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.statsItem}>
                <Text style={[styles.statsNum, { color: gold }]}>
                  {fastsCompleted}
                </Text>
                <Text style={[styles.statsLabel, { color: colors.mutedForeground }]}>
                  fasts
                </Text>
              </View>
              <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statsItem}>
                <Text style={[styles.statsNum, { color: gold }]}>
                  {totalFastMinutes}
                </Text>
                <Text style={[styles.statsLabel, { color: colors.mutedForeground }]}>
                  minutes prayed away from the scroll
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    );
  }

  // ---------- Completed ----------
  if (completed) {
    return (
      <View
        style={[styles.container, styles.fastContainer, { backgroundColor: "#0A0A14" }]}
      >
        <StatusBar barStyle="light-content" />
        <Animated.View entering={FadeIn.duration(700)} style={styles.completedWrap}>
          <View style={[styles.completedRing, { backgroundColor: gold + "22" }]}>
            <View style={[styles.completedRingInner, { backgroundColor: gold + "44" }]}>
              <Ionicons name="checkmark" size={48} color={gold} />
            </View>
          </View>
          <Text style={[styles.completedTitle, { color: "#FBF7F0" }]}>
            Well done.
          </Text>
          <Text style={[styles.completedSub, { color: "#FBF7F0AA" }]}>
            {selectedMinutes} minutes returned to Him.
          </Text>
          <TouchableOpacity
            style={[styles.completedBtn, { backgroundColor: gold }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/pray");
            }}
          >
            <Text style={styles.completedBtnText}>Pray now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 12, padding: 10 }}
          >
            <Text style={{ color: "#FBF7F099", fontFamily: "Inter_500Medium" }}>
              Back to home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ---------- Active fast ----------
  return (
    <View
      style={[styles.container, styles.fastContainer, { backgroundColor: "#0A0A14" }]}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0A0A14", "#1a1a2e", "#0A0A14"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.fastHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.fastBadge}>
          <View style={[styles.fastBadgeDot, { backgroundColor: gold }]} />
          <Text style={styles.fastBadgeText}>Phone fast in progress</Text>
        </View>
      </View>

      <View style={styles.fastBody}>
        <Animated.View style={[pulseStyle, styles.breathRing]}>
          <View style={[styles.breathRingOuter, { borderColor: gold + "33" }]}>
            <View style={[styles.breathRingMid, { borderColor: gold + "55" }]}>
              <View style={[styles.breathRingInner, { backgroundColor: gold + "1A" }]} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(600)} style={styles.timerWrap}>
          <Text style={[styles.timerText, { color: "#FBF7F0" }]}>
            {formatTime(secondsLeft)}
          </Text>
          <Text style={[styles.timerLabel, { color: "#FBF7F099" }]}>
            {Math.round(progress * 100)}% with Him
          </Text>
        </Animated.View>

        <Animated.View
          key={scriptureIdx}
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(400)}
          style={styles.scriptureWrap}
        >
          <Text style={[styles.scriptureText, { color: "#FBF7F0" }]}>
            {scripture.text}
          </Text>
          <Text style={[styles.scriptureRef, { color: gold }]}>
            — {scripture.ref}
          </Text>
        </Animated.View>
      </View>

      <View style={[styles.fastFooter, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity onPress={handleEndEarly} style={styles.endBtn}>
          <Text style={styles.endBtnText}>End early</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  pickerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  pickerKicker: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  pickerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
    marginBottom: 12,
  },
  pickerSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 28,
  },
  durationsCol: {
    gap: 12,
  },
  durationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  durationLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
  },
  statsItem: {
    flex: 1,
    alignItems: "center",
  },
  statsNum: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  statsLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    textAlign: "center",
    paddingHorizontal: 6,
  },
  statsDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 8,
  },
  // Active fast
  fastContainer: { flex: 1 },
  fastHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: "center",
  },
  fastBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF14",
  },
  fastBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fastBadgeText: {
    color: "#FBF7F0CC",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  fastBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  breathRing: {
    position: "absolute",
    top: "20%",
  },
  breathRingOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  breathRingMid: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  breathRingInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  timerWrap: {
    alignItems: "center",
    marginTop: 30,
  },
  timerText: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  scriptureWrap: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  scriptureText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 10,
  },
  scriptureRef: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  fastFooter: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  endBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  endBtnText: {
    color: "#FBF7F088",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  // Completed
  completedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  completedRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  completedRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  completedTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  completedSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 36,
    textAlign: "center",
  },
  completedBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  completedBtnText: {
    color: "#0A0A14",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
