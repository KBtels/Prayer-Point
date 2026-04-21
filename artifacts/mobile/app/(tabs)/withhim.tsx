import { ProfileButton } from "@/components/ProfileButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { transcribeAudio } from "@/lib/transcribe";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Mode = "idle" | "recording" | "transcribing" | "review";

export default function WithHimScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reflections, addReflection } = useApp();

  const topInset = Platform.OS === "web" ? 24 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const gold = colors.goldGlow ?? "#D4A843";

  const [mode, setMode] = useState<Mode>("idle");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [text, setText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for the mic
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (mode === "recording") {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(1, { duration: 250 });
    }
  }, [mode]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert(
          "Microphone needed",
          "Allow microphone access to record your reflection."
        );
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setSeconds(0);
      setMode("recording");
      tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err: any) {
      Alert.alert("Recording failed", err?.message ?? "Unable to start recording");
      setMode("idle");
    }
  };

  const stopAndTranscribe = async () => {
    try {
      if (tickRef.current) clearInterval(tickRef.current);
      if (!recording) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMode("transcribing");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) throw new Error("No recording captured");
      const transcript = await transcribeAudio(uri);
      setText(transcript.trim());
      setMode("review");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert(
        "Couldn't transcribe",
        err?.message ?? "Try again, or type your reflection instead."
      );
      setMode("idle");
      setShowTextInput(true);
    }
  };

  const cancelRecording = async () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (recording) {
      try { await recording.stopAndUnloadAsync(); } catch {}
    }
    setRecording(null);
    setSeconds(0);
    setMode("idle");
  };

  const saveReflection = () => {
    if (text.trim().length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addReflection(text.trim(), []);
    setText("");
    setMode("idle");
    setShowTextInput(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={{ width: 38 }} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          With Him
        </Text>
        <ProfileButton />
      </View>

      <View style={styles.recorderSection}>
        {mode === "idle" && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.idleWrap}>
            <Text style={[styles.kicker, { color: gold }]}>
              SPEAK · BE HEARD · REMEMBER
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              What is God speaking to you?
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Tap the mic and just talk. We'll write it down for you.
            </Text>

            <TouchableOpacity
              onPress={startRecording}
              activeOpacity={0.85}
              style={[styles.micBtn, { backgroundColor: gold }]}
            >
              <Feather name="mic" size={32} color="#0A0A14" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTextInput((v) => !v)}
              style={styles.typeToggle}
            >
              <Feather name="edit-3" size={14} color={colors.mutedForeground} />
              <Text style={[styles.typeToggleText, { color: colors.mutedForeground }]}>
                {showTextInput ? "Hide typing" : "Type instead"}
              </Text>
            </TouchableOpacity>

            {showTextInput && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.typeBox}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Write your reflection..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  style={[
                    styles.input,
                    { color: colors.foreground, borderColor: colors.border },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: text.trim().length === 0 ? 0.5 : 1,
                    },
                  ]}
                  onPress={saveReflection}
                  disabled={text.trim().length === 0}
                >
                  <Text
                    style={[styles.saveBtnText, { color: colors.primaryForeground }]}
                  >
                    Save reflection
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {mode === "recording" && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.recordingWrap}>
            <Text style={[styles.kicker, { color: gold }]}>RECORDING</Text>
            <Text style={[styles.timer, { color: colors.foreground }]}>
              {formatTime(seconds)}
            </Text>
            <Text style={[styles.recordingHint, { color: colors.mutedForeground }]}>
              Speak from the heart. Tap when done.
            </Text>

            <Animated.View style={[pulseStyle, styles.recordingMicWrap]}>
              <View
                style={[
                  styles.recordingRing,
                  { borderColor: gold + "33" },
                ]}
              >
                <TouchableOpacity
                  onPress={stopAndTranscribe}
                  activeOpacity={0.85}
                  style={[styles.recordingMic, { backgroundColor: gold }]}
                >
                  <View style={[styles.stopSquare, { backgroundColor: "#0A0A14" }]} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            <TouchableOpacity onPress={cancelRecording} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {mode === "transcribing" && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.transcribingWrap}>
            <Animated.View
              style={[
                styles.spinner,
                { borderColor: gold + "33", borderTopColor: gold },
              ]}
            />
            <Text style={[styles.transcribingText, { color: colors.foreground }]}>
              Listening to your heart...
            </Text>
            <Text style={[styles.transcribingSub, { color: colors.mutedForeground }]}>
              Writing it down for you.
            </Text>
          </Animated.View>
        )}

        {mode === "review" && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.reviewWrap}>
            <Text style={[styles.kicker, { color: gold }]}>REVIEW</Text>
            <Text style={[styles.reviewTitle, { color: colors.foreground }]}>
              Here's what we heard
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              style={[
                styles.reviewInput,
                {
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            />
            <View style={styles.reviewBtnRow}>
              <TouchableOpacity
                onPress={() => {
                  setText("");
                  setMode("idle");
                }}
                style={[styles.discardBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.discardBtnText, { color: colors.mutedForeground }]}>
                  Discard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveReflection}
                style={[styles.saveBtnLg, { backgroundColor: gold }]}
              >
                <Feather name="check" size={18} color="#0A0A14" />
                <Text style={[styles.saveBtnLgText, { color: "#0A0A14" }]}>
                  Save reflection
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      <View style={[styles.listSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.listLabel, { color: colors.mutedForeground }]}>
          {reflections.length === 0
            ? "YOUR REFLECTIONS WILL LIVE HERE"
            : `${reflections.length} REFLECTION${reflections.length === 1 ? "" : "S"}`}
        </Text>
        {reflections.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={36} color={colors.border} />
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Speak your first reflection above.
            </Text>
          </View>
        ) : (
          <FlatList
            data={reflections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: bottomInset + 100 },
            ]}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.duration(400).delay(Math.min(index, 5) * 60)}
              >
                <View
                  style={[
                    styles.reflectionCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.reflectionDate, { color: colors.mutedForeground }]}
                  >
                    {formatDate(item.date)}
                  </Text>
                  <Text style={[styles.reflectionText, { color: colors.foreground }]}>
                    {item.text}
                  </Text>
                </View>
              </Animated.View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  recorderSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  idleWrap: {
    alignItems: "center",
  },
  kicker: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },
  micBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  typeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  typeToggleText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  typeBox: {
    width: "100%",
    marginTop: 10,
    gap: 10,
  },
  input: {
    minHeight: 90,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  recordingWrap: {
    alignItems: "center",
    paddingTop: 8,
  },
  timer: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginVertical: 8,
  },
  recordingHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
  },
  recordingMicWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  recordingRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingMic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  stopSquare: {
    width: 26,
    height: 26,
    borderRadius: 4,
  },
  cancelBtn: {
    marginTop: 26,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  transcribingWrap: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 30,
  },
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 3,
    borderRadius: 24,
    marginBottom: 18,
  },
  transcribingText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  transcribingSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  reviewWrap: {
    paddingTop: 4,
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  reviewInput: {
    minHeight: 140,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
    marginBottom: 14,
    textAlignVertical: "top",
  },
  reviewBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  discardBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtnLg: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnLgText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  listSection: {
    flex: 1,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  listLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 24,
    gap: 10,
  },
  reflectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  reflectionDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  reflectionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
