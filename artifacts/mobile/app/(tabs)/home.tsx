import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const DAILY_VERSE = {
  text: '"Be still, and know that I am God."',
  ref: "Psalm 46:10",
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { name, streak, totalPrayers, lastPrayedDate } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const today = new Date();
  const dayOfWeek = today.getDay();

  const prayedToday = lastPrayedDate === today.toDateString();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 24, paddingBottom: bottomInset + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good {getTimeOfDay()}
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {name || "Friend"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="user" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(100)}
        style={[styles.streakCard, { backgroundColor: colors.prayerBg ?? "#0A0A14" }]}
      >
        <View style={styles.streakRow}>
          <View>
            <Text style={[styles.streakNumber, { color: colors.goldGlow ?? "#D4A843" }]}>
              {streak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.prayerText ?? "#E8D9B8" }]}>
              day streak
            </Text>
          </View>
          <View style={styles.streakDivider} />
          <View>
            <Text style={[styles.streakNumber, { color: colors.goldGlow ?? "#D4A843" }]}>
              {totalPrayers}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.prayerText ?? "#E8D9B8" }]}>
              prayers
            </Text>
          </View>
        </View>

        <View style={styles.weekRow}>
          {DAYS.map((d, i) => {
            const isToday = i === dayOfWeek;
            const isPast = i < dayOfWeek;
            return (
              <View key={i} style={styles.dayCol}>
                <Text style={[styles.dayLetter, { color: colors.prayerText + "88" ?? "#E8D9B880" }]}>
                  {d}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor:
                        isToday && prayedToday
                          ? colors.goldGlow ?? "#D4A843"
                          : isPast && streak > dayOfWeek - i
                          ? colors.goldGlow + "66" ?? "#D4A84366"
                          : "transparent",
                      borderColor:
                        isToday
                          ? colors.goldGlow ?? "#D4A843"
                          : colors.prayerText + "33" ?? "#E8D9B833",
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.verseLabel, { color: colors.primary }]}>
          Word of the Day
        </Text>
        <Text style={[styles.verseText, { color: colors.foreground }]}>
          {DAILY_VERSE.text}
        </Text>
        <Text style={[styles.verseRef, { color: colors.mutedForeground }]}>
          — {DAILY_VERSE.ref}
        </Text>
        <TouchableOpacity
          style={styles.verseLink}
          onPress={() => router.push("/word")}
        >
          <Text style={[styles.verseLinkText, { color: colors.primary }]}>
            Read more
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(300)}
        style={styles.actionsRow}
      >
        <TouchableOpacity
          style={[styles.prayBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/pray")}
          activeOpacity={0.85}
        >
          <Ionicons name="heart" size={22} color={colors.primaryForeground} />
          <Text style={[styles.prayBtnText, { color: colors.primaryForeground }]}>
            Pray Now
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(400)}
        style={styles.secondaryActions}
      >
        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/reflect")}
          activeOpacity={0.85}
        >
          <Feather name="book-open" size={20} color={colors.foreground} />
          <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
            Reflect
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/word")}
          activeOpacity={0.85}
        >
          <Feather name="bookmark" size={20} color={colors.foreground} />
          <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
            Today's Word
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  name: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  streakCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  streakNumber: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    lineHeight: 44,
  },
  streakLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  streakDivider: {
    width: 1,
    height: 48,
    backgroundColor: "#ffffff22",
    marginHorizontal: 32,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCol: {
    alignItems: "center",
    gap: 8,
  },
  dayLetter: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  verseCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  verseLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  verseText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: 8,
  },
  verseRef: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  verseLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verseLinkText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  actionsRow: {
    marginBottom: 12,
  },
  prayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: 20,
  },
  prayBtnText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
