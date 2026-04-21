import HabitQuoteModal, { hasShownQuoteThisSession, markQuoteShownThisSession } from "@/components/HabitQuoteModal";
import { Logo } from "@/components/Logo";
import { ProfileButton } from "@/components/ProfileButton";
import { VideoBackground } from "@/components/VideoBackground";
import { HABIT_QUOTES } from "@/constants/quotes";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const { name, streak, totalPrayers, lastPrayedDate, prayerLogs } = useApp();

  const withGodPct = React.useMemo(() => {
    const WINDOW = 30;
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - (WINDOW - 1));
    const recentDays = new Set<string>();
    for (const log of prayerLogs ?? []) {
      const d = new Date(log.date);
      if (!isNaN(d.getTime()) && d >= cutoff && d <= now) {
        recentDays.add(d.toDateString());
      }
    }
    return Math.round((recentDays.size / WINDOW) * 100);
  }, [prayerLogs]);
  const [habitQuote] = useState(
    () => HABIT_QUOTES[Math.floor(Math.random() * HABIT_QUOTES.length)]
  );
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    if (!hasShownQuoteThisSession()) {
      const t = setTimeout(() => {
        setShowQuote(true);
        markQuoteShownThisSession();
      }, 450);
      return () => clearTimeout(t);
    }
  }, []);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const today = new Date();
  const dayOfWeek = today.getDay();

  const prayedToday = lastPrayedDate === today.toDateString();

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <VideoBackground
          source={require("@/assets/videos/church-white.mp4")}
          webUrl="/videos/church-white.mp4"
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={["rgba(10,10,20,0.25)", "rgba(10,10,20,0.05)", "rgba(251,247,240,0)", colors.background]}
          locations={[0, 0.4, 0.75, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={[styles.header, { paddingTop: topInset + 16 }]}
        >
          <View>
            <Logo size={32} color="#FFFFFF" />
            <Text style={[styles.greeting, { color: "rgba(255,255,255,0.85)", marginTop: 8 }]}>
              Good {getTimeOfDay()}, {name || "Friend"}
            </Text>
          </View>
          <ProfileButton tint="rgba(255,255,255,0.12)" borderColor="rgba(255,255,255,0.25)" />
        </Animated.View>
      </View>

      <View style={styles.body}>

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
          <View style={styles.streakDivider} />
          <View>
            <Text style={[styles.streakNumber, { color: colors.goldGlow ?? "#D4A843" }]}>
              {withGodPct}%
            </Text>
            <Text style={[styles.streakLabel, { color: colors.prayerText ?? "#E8D9B8" }]}>
              with God
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
        entering={FadeInDown.duration(500).delay(350)}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/fast")}
          style={[
            styles.fastCard,
            {
              backgroundColor: colors.card,
              borderColor: (colors.goldGlow ?? "#D4A843") + "55",
            },
          ]}
        >
          <View
            style={[
              styles.fastIcon,
              { backgroundColor: (colors.goldGlow ?? "#D4A843") + "1F" },
            ]}
          >
            <Ionicons
              name="leaf-outline"
              size={20}
              color={colors.goldGlow ?? "#D4A843"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fastTitle, { color: colors.foreground }]}>
              Phone Fast
            </Text>
            <Text style={[styles.fastSub, { color: colors.mutedForeground }]}>
              Trade the scroll for stillness — 5, 15, 30, or 60 minutes.
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(400)}
        style={styles.secondaryActions}
      >
        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/withhim")}
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
      </View>
    </ScrollView>

    <HabitQuoteModal
      visible={showQuote}
      quote={habitQuote}
      onClose={() => setShowQuote(false)}
    />
    </>
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
  content: {},
  hero: {
    height: 280,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  body: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  fastCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  fastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fastTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  fastSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
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
