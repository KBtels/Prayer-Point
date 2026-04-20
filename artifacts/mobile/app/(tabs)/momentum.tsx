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
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
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

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MomentumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    streak,
    longestStreak,
    totalPrayers,
    prayerLogs,
    lastPrayedDate,
    reflections,
    friends,
    addFriend,
    removeFriend,
  } = useApp();

  const topInset = Platform.OS === "web" ? 24 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const gold = colors.goldGlow ?? "#D4A843";
  const accent = colors.accent ?? "#8B5E2A";

  const today = new Date();
  const prayedToday = lastPrayedDate === today.toDateString();

  // Pinned habit quote — rotates daily, stable while screen is open
  const pinnedQuote = useMemo(() => {
    const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return HABIT_QUOTES[dayKey % HABIT_QUOTES.length];
  }, []);

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

  // Last 7 days bar data
  const last7 = useMemo(() => {
    const days: { label: string; key: string; count: number; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toDateString();
      const log = prayerLogs.find((l) => l.date === key);
      days.push({
        label: DAY_LETTERS[d.getDay()],
        key,
        count: log?.count ?? 0,
        isToday: i === 0,
      });
    }
    return days;
  }, [prayerLogs]);

  const weekTotal = last7.reduce((s, d) => s + d.count, 0);
  const maxBar = Math.max(1, ...last7.map((d) => d.count));
  const weeklyAvg = (weekTotal / 7).toFixed(1);

  // Last 30 days
  const last30Total = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const log = prayerLogs.find((l) => l.date === d.toDateString());
      if (log) total += log.count;
    }
    return total;
  }, [prayerLogs]);

  // Top categories
  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of prayerLogs) {
      for (const c of log.categories) counts[c] = (counts[c] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [prayerLogs]);

  const maxCat = topCategories.length > 0 ? topCategories[0][1] : 1;

  // ── Friends ────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [friendName, setFriendName] = useState("");

  const handleAddFriend = () => {
    if (!friendName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addFriend(friendName);
    setFriendName("");
    setModalOpen(false);
  };

  const handleInviteShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Pray with me on Prayer Point 🙏 — let's build a streak together.`,
      });
    } catch {
      // ignore
    }
  };

  const handleRemoveFriend = (id: string, _name: string) => {
    Haptics.selectionAsync();
    removeFriend(id);
  };

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
        <Animated.View
          entering={FadeInDown.duration(400).delay(40)}
          style={styles.header}
        >
          <Text style={[styles.eyebrow, { color: "rgba(255,255,255,0.85)" }]}>
            YOUR JOURNEY
          </Text>
          <Text style={[styles.title, { color: "#FFFFFF" }]}>
            Prayer Momentum
          </Text>
        </Animated.View>

        {/* Hero flame card */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(80)}
          style={[
            styles.heroCard,
            { backgroundColor: "transparent", borderColor: "transparent" },
          ]}
        >
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

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatPill
            colors={colors}
            delay={120}
            value={longestStreak}
            label="Longest"
            icon="trending-up"
          />
          <StatPill
            colors={colors}
            delay={170}
            value={totalPrayers}
            label="Total"
            icon="heart"
          />
          <StatPill
            colors={colors}
            delay={220}
            value={reflections.length}
            label="Reflections"
            icon="book"
          />
        </View>

        {/* Pinned habit quote */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(260)}
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

        {/* Milestones */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(340)}
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

        {/* Weekly chart */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(380)}
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHead}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                This week
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}
              >
                {weekTotal} prayer{weekTotal === 1 ? "" : "s"} • avg {weeklyAvg} / day
              </Text>
            </View>
            <View style={[styles.weekPill, { backgroundColor: gold + "1A" }]}>
              <Ionicons name="calendar" size={12} color={accent} />
              <Text style={[styles.weekPillText, { color: accent }]}>
                Last 7 days
              </Text>
            </View>
          </View>

          <View style={styles.chart}>
            {last7.map((d, i) => {
              const heightPct = (d.count / maxBar) * 100;
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max(d.count > 0 ? 8 : 2, heightPct)}%`,
                          backgroundColor:
                            d.count > 0 ? gold : colors.border,
                          opacity: d.isToday ? 1 : 0.85,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      {
                        color: d.isToday ? accent : colors.mutedForeground,
                        fontFamily: d.isToday
                          ? "Inter_700Bold"
                          : "Inter_500Medium",
                      },
                    ]}
                  >
                    {d.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Insights row */}
        <View style={styles.insightsRow}>
          <InsightCard
            colors={colors}
            delay={420}
            value={last30Total}
            label="Last 30 days"
            sublabel="prayers prayed"
          />
          <InsightCard
            colors={colors}
            delay={460}
            value={prayerLogs.length}
            label="Active days"
            sublabel="all time"
          />
        </View>

        {/* Top categories */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(500)}
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            What you pray about most
          </Text>
          {topCategories.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground, marginTop: 12 },
              ]}
            >
              Pray a few times to see your top topics here.
            </Text>
          ) : (
            <View style={{ marginTop: 14, gap: 10 }}>
              {topCategories.map(([cat, count], idx) => {
                const pct = (count / maxCat) * 100;
                return (
                  <View key={cat}>
                    <View style={styles.catLabelRow}>
                      <Text
                        style={[styles.catLabel, { color: colors.foreground }]}
                      >
                        {cat}
                      </Text>
                      <Text
                        style={[
                          styles.catCount,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                    <View
                      style={[styles.catTrack, { backgroundColor: colors.muted }]}
                    >
                      <View
                        style={[
                          styles.catFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: idx === 0 ? gold : gold + "88",
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* Shared Streaks */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(540)}
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHead}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Shared streaks
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}
              >
                {friends.length === 0
                  ? "Pray alongside the people you love."
                  : `Praying together with ${friends.length} ${
                      friends.length === 1 ? "person" : "people"
                    }`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, { borderColor: gold + "55" }]}
              onPress={() => setModalOpen(true)}
              activeOpacity={0.8}
            >
              <Feather name="user-plus" size={14} color={accent} />
              <Text style={[styles.addBtnText, { color: accent }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {friends.length === 0 ? (
            <View style={styles.friendsEmpty}>
              <LinearGradient
                colors={[gold + "16", "transparent"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={[styles.friendsEmptyIcon, { backgroundColor: gold + "22" }]}>
                <Ionicons name="people" size={22} color={accent} />
              </View>
              <Text style={[styles.friendsEmptyTitle, { color: colors.foreground }]}>
                Pray together
              </Text>
              <Text
                style={[styles.friendsEmptyText, { color: colors.mutedForeground }]}
              >
                Invite a loved one and watch your shared streak grow each day you both pray.
              </Text>
              <TouchableOpacity
                style={[styles.inviteBtn, { backgroundColor: colors.primary }]}
                onPress={handleInviteShare}
                activeOpacity={0.85}
              >
                <Feather name="send" size={14} color={colors.primaryForeground} />
                <Text
                  style={[
                    styles.inviteBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Send an invite
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 14, gap: 10 }}>
              {friends.map((f) => {
                const initials = f.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <View
                    key={f.id}
                    style={[
                      styles.friendRow,
                      { borderColor: colors.border, backgroundColor: colors.muted },
                    ]}
                  >
                    <View
                      style={[styles.friendAvatar, { backgroundColor: gold + "33" }]}
                    >
                      <Text style={[styles.friendInitials, { color: accent }]}>
                        {initials || "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.friendName, { color: colors.foreground }]}
                      >
                        {f.name}
                      </Text>
                      <View style={styles.friendStreak}>
                        <Ionicons name="flame" size={12} color={gold} />
                        <Text
                          style={[
                            styles.friendStreakText,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {f.sharedDays} day{f.sharedDays === 1 ? "" : "s"} together
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveFriend(f.id, f.name)}
                      hitSlop={10}
                    >
                      <Feather
                        name="x"
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
              <TouchableOpacity
                style={[styles.inviteBtn, { backgroundColor: colors.primary, marginTop: 4 }]}
                onPress={handleInviteShare}
                activeOpacity={0.85}
              >
                <Feather name="send" size={14} color={colors.primaryForeground} />
                <Text
                  style={[styles.inviteBtnText, { color: colors.primaryForeground }]}
                >
                  Invite more friends
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Add friend modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalOpen(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Add a friend
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.mutedForeground }]}
            >
              Enter their name to start a shared streak.
            </Text>
            <TextInput
              value={friendName}
              onChangeText={setFriendName}
              placeholder="e.g. Mum"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              style={[
                styles.modalInput,
                {
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.muted,
                },
              ]}
              onSubmitEditing={handleAddFriend}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setModalOpen(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddFriend}
              >
                <Text
                  style={[styles.modalBtnText, { color: colors.primaryForeground }]}
                >
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function StatPill({
  colors,
  delay,
  value,
  label,
  icon,
}: {
  colors: any;
  delay: number;
  value: number;
  label: string;
  icon: any;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(delay)}
      style={[
        styles.statPill,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={14} color={colors.mutedForeground} />
      <Text style={[styles.statPillValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statPillLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

function InsightCard({
  colors,
  delay,
  value,
  label,
  sublabel,
}: {
  colors: any;
  delay: number;
  value: number;
  label: string;
  sublabel: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(delay)}
      style={[
        styles.insightCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.insightValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.insightLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <Text style={[styles.insightSub, { color: colors.mutedForeground }]}>
        {sublabel}
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
  logoRow: { marginBottom: 14 },
  header: { marginBottom: 16 },
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

  // Hero
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

  // Stat pills
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statPillValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statPillLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  // Pinned quote
  pinnedQuoteCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
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

  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  // Calendar
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
  calModeToggle: {
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 6,
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

  // Milestones
  milestonesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  milestone: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  milestoneNum: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  // Weekly chart
  weekPill: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  weekPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  chart: {
    flexDirection: "row",
    height: 130,
    marginTop: 18,
    alignItems: "flex-end",
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barTrack: {
    width: "100%",
    height: 100,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 6,
  },

  // Insights
  insightsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  insightCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  insightValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  insightLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  insightSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },

  // Categories
  catLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  catLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  catCount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  catTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  catFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },

  // Friends
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  friendsEmpty: {
    marginTop: 14,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  friendsEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  friendsEmptyTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  friendsEmptyText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  inviteBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  friendAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  friendInitials: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  friendName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  friendStreak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  friendStreakText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
