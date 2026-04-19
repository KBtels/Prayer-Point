import { Logo } from "@/components/Logo";
import { VideoBackground } from "@/components/VideoBackground";
import { HABIT_QUOTES } from "@/constants/quotes";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
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
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreakScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { streak, totalPrayers, lastPrayedDate, reflections } = useApp();

  // Pinned quote — rotates daily, stable while screen is open
  const pinnedQuote = useMemo(() => {
    const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return HABIT_QUOTES[dayKey % HABIT_QUOTES.length];
  }, []);

  const topInset = Platform.OS === "web" ? 24 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const today = new Date();
  const prayedToday = lastPrayedDate === today.toDateString();

  // Build set of "prayed" dates from streak (most recent N days back from lastPrayedDate)
  const prayedDates = useMemo(() => {
    const set = new Set<string>();
    if (!lastPrayedDate || streak === 0) return set;
    const last = new Date(lastPrayedDate);
    for (let i = 0; i < streak; i++) {
      const d = new Date(last);
      d.setDate(last.getDate() - i);
      set.add(d.toDateString());
    }
    return set;
  }, [streak, lastPrayedDate]);

  // Calendar state
  const [calMode, setCalMode] = useState<"week" | "month">("week");
  // Anchor date — for week mode points to any day in the visible week,
  // for month mode points to any day in the visible month.
  const [anchor, setAnchor] = useState<Date>(() => new Date());

  const monthCells = useMemo(() => {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: Array<{ day: number | null; date: Date | null }> = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, date: new Date(y, m, d) });
    }
    return cells;
  }, [anchor]);

  const weekCells = useMemo(() => {
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - anchor.getDay()); // Sunday
    const cells: Array<{ day: number | null; date: Date | null }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ day: d.getDate(), date: d });
    }
    return cells;
  }, [anchor]);

  const calendarCells = calMode === "week" ? weekCells : monthCells;

  const calHeaderLabel = useMemo(() => {
    if (calMode === "month") {
      return `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
    }
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - anchor.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const startLabel = `${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()}`;
    const endLabel = sameMonth
      ? `${end.getDate()}`
      : `${MONTHS[end.getMonth()].slice(0, 3)} ${end.getDate()}`;
    return `${startLabel} – ${endLabel}`;
  }, [calMode, anchor]);

  // Flame pulse
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleInvite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = `I'm on a ${streak}-day prayer streak with Prayer Point 🙏\n\nJoin me — let's grow our faith together.`;
    try {
      await Share.share({ message });
    } catch {
      // ignore
    }
  };

  const goPrev = () => {
    Haptics.selectionAsync();
    const next = new Date(anchor);
    if (calMode === "week") next.setDate(anchor.getDate() - 7);
    else next.setMonth(anchor.getMonth() - 1);
    setAnchor(next);
  };
  const goNext = () => {
    Haptics.selectionAsync();
    const next = new Date(anchor);
    if (calMode === "week") next.setDate(anchor.getDate() + 7);
    else next.setMonth(anchor.getMonth() + 1);
    setAnchor(next);
  };
  const toggleMode = () => {
    Haptics.selectionAsync();
    setCalMode(calMode === "week" ? "month" : "week");
  };

  const gold = colors.goldGlow ?? "#D4A843";
  const accent = colors.accent ?? "#8B5E2A";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Background video — fades into the cream background */}
      <View style={[styles.videoLayer, { height: topInset + 280 }]}>
        <VideoBackground
          source={require("@/assets/videos/walking-group.mp4")}
          webUrl="/videos/walking-group.mp4"
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[
            "rgba(10,10,20,0.45)",
            "rgba(10,10,20,0.18)",
            "rgba(251,247,240,0.15)",
            colors.background,
          ]}
          locations={[0, 0.45, 0.78, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.logoRow}>
          <Logo size={28} color="#FFFFFF" />
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.header}>
          <Text style={[styles.eyebrow, { color: "rgba(255,255,255,0.85)" }]}>
            YOUR JOURNEY
          </Text>
          <Text style={[styles.title, { color: "#FFFFFF" }]}>
            Streak
          </Text>
        </Animated.View>

        {/* Pinned habit quote */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(75)}
          style={[
            styles.pinnedQuoteCard,
            { backgroundColor: colors.card, borderColor: gold + "55" },
          ]}
        >
          <View style={styles.pinnedQuoteHeader}>
            <Ionicons name="bookmark" size={14} color={gold} />
            <Text style={[styles.pinnedQuoteLabel, { color: gold }]}>
              On Habit
            </Text>
          </View>
          <Text style={[styles.pinnedQuoteText, { color: colors.foreground }]}>
            "{pinnedQuote.text}"
          </Text>
          <Text style={[styles.pinnedQuoteAuthor, { color: colors.mutedForeground }]}>
            — {pinnedQuote.author}
          </Text>
        </Animated.View>

        {/* Hero card with flame */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <LinearGradient
            colors={[gold + "18", "transparent"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <Animated.View style={[styles.flameWrap, pulseStyle]}>
            <View style={[styles.flameRing, { backgroundColor: gold + "1A" }]}>
              <View style={[styles.flameRingInner, { backgroundColor: gold + "33" }]}>
                <Ionicons name="flame" size={42} color={gold} />
              </View>
            </View>
          </Animated.View>

          <Text style={[styles.heroNumber, { color: colors.foreground }]}>
            {streak}
          </Text>
          <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>
            day{streak === 1 ? "" : "s"} in a row
          </Text>

          <View
            style={[
              styles.prayedPill,
              {
                backgroundColor: prayedToday ? gold + "22" : colors.muted,
                borderColor: prayedToday ? gold + "55" : colors.border,
              },
            ]}
          >
            <Ionicons
              name={prayedToday ? "checkmark-circle" : "time-outline"}
              size={14}
              color={prayedToday ? accent : colors.mutedForeground}
            />
            <Text
              style={[
                styles.prayedPillText,
                { color: prayedToday ? accent : colors.mutedForeground },
              ]}
            >
              {prayedToday ? "Prayed today" : "Pray today to keep it going"}
            </Text>
          </View>
        </Animated.View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard
            delay={200}
            icon="heart"
            label="Total prayers"
            value={totalPrayers}
            colors={colors}
          />
          <StatCard
            delay={250}
            icon="book-open"
            label="Reflections"
            value={reflections.length}
            colors={colors}
          />
        </View>

        {/* Calendar history */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={goPrev} style={styles.calArrow}>
              <Feather name="chevron-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.calTitle, { color: colors.foreground }]}>
              {calHeaderLabel}
            </Text>
            <TouchableOpacity onPress={goNext} style={styles.calArrow}>
              <Feather name="chevron-right" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Soft week/month toggle */}
          <TouchableOpacity
            onPress={toggleMode}
            activeOpacity={0.7}
            style={styles.calModeToggle}
          >
            <Text style={[styles.calModeText, { color: colors.mutedForeground }]}>
              {calMode === "week" ? "Show month" : "Show week"}
            </Text>
          </TouchableOpacity>

          <View style={styles.calDayLetters}>
            {DAY_LETTERS.map((d, i) => (
              <Text
                key={i}
                style={[styles.calDayLetter, { color: colors.mutedForeground }]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.calGrid}>
            {calendarCells.map((cell, i) => {
              if (!cell.day) return <View key={i} style={styles.calCell} />;
              const isFuture = cell.date! > today;
              const isToday =
                cell.date!.toDateString() === today.toDateString();
              const wasPrayed = prayedDates.has(cell.date!.toDateString());
              return (
                <View key={i} style={styles.calCell}>
                  <View
                    style={[
                      styles.calDot,
                      {
                        backgroundColor: wasPrayed ? gold : "transparent",
                        borderColor: isToday
                          ? gold
                          : wasPrayed
                            ? gold
                            : "transparent",
                        borderWidth: isToday ? 1.5 : 0,
                        opacity: isFuture ? 0.3 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.calDayNum,
                        {
                          color: wasPrayed
                            ? "#FFFFFF"
                            : isToday
                              ? accent
                              : colors.foreground,
                          fontFamily: isToday
                            ? "Inter_700Bold"
                            : "Inter_500Medium",
                        },
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Milestones */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Milestones
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
            Faith grows one day at a time.
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
                      borderColor: reached ? gold : colors.border,
                      backgroundColor: reached ? gold + "18" : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name={reached ? "flame" : "flame-outline"}
                    size={16}
                    color={reached ? gold : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.milestoneNum,
                      { color: reached ? accent : colors.mutedForeground },
                    ]}
                  >
                    {m}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Invite */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(500)}
          style={[
            styles.inviteCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.inviteIcon, { backgroundColor: gold + "1F" }]}>
            <Ionicons name="people" size={22} color={accent} />
          </View>
          <Text style={[styles.inviteTitle, { color: colors.foreground }]}>
            Pray together
          </Text>
          <Text style={[styles.inviteText, { color: colors.mutedForeground }]}>
            "Where two or three gather in my name, there am I with them." — Matthew 18:20
          </Text>
          <TouchableOpacity
            style={[styles.inviteBtn, { backgroundColor: colors.primary }]}
            onPress={handleInvite}
            activeOpacity={0.85}
          >
            <Feather name="user-plus" size={16} color={colors.primaryForeground} />
            <Text
              style={[styles.inviteBtnText, { color: colors.primaryForeground }]}
            >
              Invite a loved one
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  delay,
  icon,
  label,
  value,
  colors,
}: {
  delay: number;
  icon: any;
  label: string;
  value: number;
  colors: any;
}) {
  const gold = colors.goldGlow ?? "#D4A843";
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(delay)}
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: gold + "1A" }]}>
        <Feather name={icon} size={16} color={colors.accent ?? "#8B5E2A"} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  videoLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  logoRow: {
    marginBottom: 14,
  },
  header: { marginBottom: 16 },
  calModeToggle: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  calModeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.4,
    textDecorationLine: "underline",
    opacity: 0.7,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },

  pinnedQuoteCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  pinnedQuoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  pinnedQuoteLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  pinnedQuoteText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 8,
  },
  pinnedQuoteAuthor: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 14,
  },
  flameWrap: { marginBottom: 12 },
  flameRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  flameRingInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  heroNumber: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    lineHeight: 70,
  },
  heroLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    marginBottom: 14,
  },
  prayedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  prayedPillText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    marginBottom: 14,
  },

  calHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  calTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  calDayLetters: {
    flexDirection: "row",
    marginBottom: 6,
  },
  calDayLetter: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  calDot: {
    width: "85%",
    height: "85%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  calDayNum: {
    fontSize: 12,
  },

  milestonesRow: {
    flexDirection: "row",
    gap: 8,
  },
  milestone: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  milestoneNum: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },

  inviteCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
  },
  inviteIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  inviteTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  inviteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignSelf: "stretch",
  },
  inviteBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
