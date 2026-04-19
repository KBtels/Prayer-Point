import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
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
    friends,
    addFriend,
    removeFriend,
  } = useApp();

  const topInset = Platform.OS === "web" ? 24 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const gold = colors.goldGlow ?? "#D4A843";
  const accent = colors.accent ?? "#8B5E2A";

  // ── Analytics ─────────────────────────────────────────────────────────────
  const today = new Date();

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

  const handleRemoveFriend = (id: string, name: string) => {
    Haptics.selectionAsync();
    removeFriend(id);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
          <Logo size={26} />
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(40)}
          style={styles.header}
        >
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            YOUR ANALYTICS
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Prayer Momentum
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            See how your prayer life is growing — and grow together with friends.
          </Text>
        </Animated.View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatPill
            colors={colors}
            delay={120}
            value={streak}
            label="Current"
            icon="flame"
            tone="gold"
          />
          <StatPill
            colors={colors}
            delay={170}
            value={longestStreak}
            label="Longest"
            icon="trending-up"
          />
          <StatPill
            colors={colors}
            delay={220}
            value={totalPrayers}
            label="Total"
            icon="heart"
          />
        </View>

        {/* Weekly chart */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(280)}
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
            delay={340}
            value={last30Total}
            label="Last 30 days"
            sublabel="prayers prayed"
          />
          <InsightCard
            colors={colors}
            delay={380}
            value={prayerLogs.length}
            label="Active days"
            sublabel="all time"
          />
        </View>

        {/* Top categories */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(420)}
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
          entering={FadeInDown.duration(500).delay(480)}
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
  tone,
}: {
  colors: any;
  delay: number;
  value: number;
  label: string;
  icon: any;
  tone?: "gold";
}) {
  const gold = colors.goldGlow ?? "#D4A843";
  const accent = colors.accent ?? "#8B5E2A";
  const isGold = tone === "gold";
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(delay)}
      style={[
        styles.statPill,
        {
          backgroundColor: isGold ? gold + "16" : colors.card,
          borderColor: isGold ? gold + "55" : colors.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={14}
        color={isGold ? accent : colors.mutedForeground}
      />
      <Text style={[styles.statPillValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text
        style={[
          styles.statPillLabel,
          { color: isGold ? accent : colors.mutedForeground },
        ]}
      >
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
  logoRow: { marginBottom: 12 },
  header: { marginBottom: 18 },
  eyebrow: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },

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
    gap: 2,
  },
  insightValue: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  insightSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },

  catLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
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

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  friendsEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  friendsEmptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  friendsEmptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "stretch",
  },
  inviteBtnText: {
    fontSize: 14,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontFamily: "Inter_500Medium",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
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
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
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
