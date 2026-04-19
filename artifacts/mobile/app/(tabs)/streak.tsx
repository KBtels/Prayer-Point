import { VideoBackground } from "@/components/VideoBackground";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreakScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { name, streak, totalPrayers, lastPrayedDate, reflections } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const prayedToday = lastPrayedDate === today.toDateString();

  // Animated counter for big streak number
  const counter = useSharedValue(0);
  const flameScale = useSharedValue(1);
  const flameGlow = useSharedValue(0.6);

  useEffect(() => {
    counter.value = withTiming(streak, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    flameGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 }),
      ),
      -1,
      false,
    );
  }, [streak]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
    opacity: flameGlow.value,
  }));

  const handleInvite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const message = `I'm on a ${streak}-day prayer streak with God First 🙏\n\nJoin me — let's grow our faith together. Download God First and let's pray as one.`;
    try {
      await Share.share({ message });
    } catch {
      // ignore
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.prayerBg ?? "#0A0A14" }]}>
      <VideoBackground
        source={require("@/assets/videos/streak-page.mp4")}
        webUrl="/videos/streak-page.mp4"
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[
          "rgba(10,10,20,0.55)",
          "rgba(10,10,20,0.75)",
          "rgba(10,10,20,0.92)",
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 24, paddingBottom: bottomInset + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.goldGlow ?? "#D4A843" }]}>
            YOUR JOURNEY
          </Text>
          <Text style={[styles.title, { color: "#FFFFFF" }]}>
            Streak
          </Text>
        </Animated.View>

        {/* Big animated streak number */}
        <Animated.View
          entering={FadeIn.duration(700).delay(200)}
          style={styles.heroNumberWrap}
        >
          <Animated.View style={[styles.flameGlow, flameStyle]}>
            <View
              style={[
                styles.flameGlowInner,
                { backgroundColor: (colors.goldGlow ?? "#D4A843") + "33" },
              ]}
            />
          </Animated.View>

          <View style={styles.numberRow}>
            <CountUp value={streak} color={colors.goldGlow ?? "#D4A843"} />
            <Ionicons
              name="flame"
              size={48}
              color={colors.goldGlow ?? "#D4A843"}
              style={{ marginLeft: 8 }}
            />
          </View>
          <Text style={[styles.heroLabel, { color: "rgba(255,255,255,0.75)" }]}>
            day{streak === 1 ? "" : "s"} in a row
          </Text>
        </Animated.View>

        {/* Week dots */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          style={styles.weekRow}
        >
          {DAYS.map((d, i) => {
            const isToday = i === dayOfWeek;
            const isPast = i < dayOfWeek;
            const filled =
              (isToday && prayedToday) ||
              (isPast && streak > dayOfWeek - i);
            return (
              <View key={i} style={styles.dayCol}>
                <Text style={[styles.dayLetter, { color: "rgba(255,255,255,0.6)" }]}>
                  {d}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: filled
                        ? colors.goldGlow ?? "#D4A843"
                        : "transparent",
                      borderColor: isToday
                        ? colors.goldGlow ?? "#D4A843"
                        : "rgba(255,255,255,0.25)",
                    },
                  ]}
                >
                  {filled && (
                    <Ionicons name="checkmark" size={14} color="#0A0A14" />
                  )}
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard
            delay={500}
            icon="heart"
            label="Total prayers"
            value={totalPrayers}
            color={colors.goldGlow ?? "#D4A843"}
          />
          <StatCard
            delay={600}
            icon="book-open"
            label="Reflections"
            value={reflections.length}
            color={colors.goldGlow ?? "#D4A843"}
          />
        </View>

        {/* Invite hero card */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(700)}
          style={[
            styles.inviteCard,
            { backgroundColor: "rgba(212,168,67,0.12)", borderColor: (colors.goldGlow ?? "#D4A843") + "55" },
          ]}
        >
          <View style={styles.inviteHeader}>
            <View
              style={[
                styles.inviteIconWrap,
                { backgroundColor: (colors.goldGlow ?? "#D4A843") + "22" },
              ]}
            >
              <Ionicons name="people" size={26} color={colors.goldGlow ?? "#D4A843"} />
            </View>
            <Text style={[styles.inviteTitle, { color: "#FFFFFF" }]}>
              Pray together
            </Text>
          </View>

          <Text style={[styles.inviteText, { color: "rgba(255,255,255,0.85)" }]}>
            Faith grows when shared. Invite a friend or loved one to walk this
            journey with you — every streak is stronger together.
          </Text>

          <View style={styles.inviteStatsRow}>
            <View style={styles.inviteStatCol}>
              <Text style={[styles.inviteStatNum, { color: colors.goldGlow ?? "#D4A843" }]}>
                {streak}
              </Text>
              <Text style={[styles.inviteStatLabel, { color: "rgba(255,255,255,0.6)" }]}>
                Your streak
              </Text>
            </View>
            <View style={styles.inviteDivider} />
            <View style={styles.inviteStatCol}>
              <Text style={[styles.inviteStatNum, { color: colors.goldGlow ?? "#D4A843" }]}>
                0
              </Text>
              <Text style={[styles.inviteStatLabel, { color: "rgba(255,255,255,0.6)" }]}>
                Friends invited
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.inviteBtn, { backgroundColor: colors.goldGlow ?? "#D4A843" }]}
            onPress={handleInvite}
            activeOpacity={0.85}
          >
            <Feather name="user-plus" size={18} color="#0A0A14" />
            <Text style={styles.inviteBtnText}>Invite a loved one</Text>
          </TouchableOpacity>

          <Text style={[styles.inviteFootnote, { color: "rgba(255,255,255,0.5)" }]}>
            "Where two or three gather in my name, there am I with them." — Matthew 18:20
          </Text>
        </Animated.View>

        {/* Milestones */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(900)}
          style={styles.milestonesWrap}
        >
          <Text style={[styles.sectionTitle, { color: "rgba(255,255,255,0.7)" }]}>
            Milestones
          </Text>
          <View style={styles.milestonesRow}>
            {[3, 7, 14, 30, 60].map((m) => {
              const reached = streak >= m;
              return (
                <View
                  key={m}
                  style={[
                    styles.milestone,
                    {
                      borderColor: reached
                        ? colors.goldGlow ?? "#D4A843"
                        : "rgba(255,255,255,0.15)",
                      backgroundColor: reached
                        ? (colors.goldGlow ?? "#D4A843") + "22"
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.milestoneNum,
                      { color: reached ? colors.goldGlow ?? "#D4A843" : "rgba(255,255,255,0.4)" },
                    ]}
                  >
                    {m}
                  </Text>
                  <Text
                    style={[
                      styles.milestoneLabel,
                      { color: reached ? "#FFFFFF" : "rgba(255,255,255,0.4)" },
                    ]}
                  >
                    days
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function CountUp({ value, color }: { value: number; color: string }) {
  // Simple animated count using a key-based remount; for smoother counter use Reanimated string
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const from = 0;
    const to = value;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <Text style={[styles.heroNumber, { color }]}>{display}</Text>;
}

function StatCard({
  delay,
  icon,
  label,
  value,
  color,
}: {
  delay: number;
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(delay)}
      style={[
        styles.statCard,
        { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" },
      ]}
    >
      <Feather name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color: "#FFFFFF" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.6)" }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  header: { marginBottom: 24 },
  eyebrow: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
  },
  heroNumberWrap: {
    alignItems: "center",
    paddingVertical: 28,
    marginBottom: 8,
    position: "relative",
  },
  flameGlow: {
    position: "absolute",
    top: 10,
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  flameGlowInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroNumber: {
    fontSize: 96,
    fontFamily: "Inter_700Bold",
    lineHeight: 100,
  },
  heroLabel: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  dayCol: { alignItems: "center", gap: 10 },
  dayLetter: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  statValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  inviteCard: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    marginBottom: 24,
  },
  inviteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  inviteIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  inviteText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
    marginBottom: 18,
  },
  inviteStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    marginBottom: 18,
  },
  inviteStatCol: {
    flex: 1,
    alignItems: "center",
  },
  inviteStatNum: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  inviteStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  inviteDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  inviteBtnText: {
    color: "#0A0A14",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  inviteFootnote: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
  milestonesWrap: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  milestonesRow: {
    flexDirection: "row",
    gap: 10,
  },
  milestone: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  milestoneLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
