import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TODAY_VERSE = {
  text: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!",
  ref: "Psalm 46:10",
  reflection:
    "In a world that never stops moving, God invites us into stillness. Not the stillness of inactivity, but the stillness of trust — the quiet confidence that God is in control. When life overwhelms, when uncertainty grips, when noise drowns everything out, this verse is an invitation: stop striving, stop worrying, and know who God is. He is exalted. He is in charge. You can rest.",
  practice:
    "Today, set aside 5 minutes of complete silence. No phone, no music, no distractions. Simply sit and remind yourself: \"God is God, and I am not.\" Let that truth settle over you.",
};

const RECENT_VERSES = [
  {
    text: "The Lord is my shepherd; I shall not want.",
    ref: "Psalm 23:1",
    date: "Yesterday",
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    ref: "Philippians 4:13",
    date: "2 days ago",
  },
  {
    text: "For God so loved the world that He gave His only Son.",
    ref: "John 3:16",
    date: "3 days ago",
  },
];

export default function WordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

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
          Word of the Day
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={[
            styles.mainCard,
            { backgroundColor: colors.prayerBg ?? "#0A0A14" },
          ]}
        >
          <Text style={[styles.dateLabel, { color: colors.goldGlow + "88" ?? "#D4A84388" }]}>
            TODAY
          </Text>
          <Text
            style={[styles.mainVerse, { color: colors.prayerText ?? "#E8D9B8" }]}
          >
            "{TODAY_VERSE.text}"
          </Text>
          <Text style={[styles.mainRef, { color: colors.goldGlow ?? "#D4A843" }]}>
            — {TODAY_VERSE.ref}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Reflection
          </Text>
          <Text style={[styles.sectionBody, { color: colors.foreground }]}>
            {TODAY_VERSE.reflection}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Practice for Today
          </Text>
          <Text style={[styles.sectionBody, { color: colors.foreground }]}>
            {TODAY_VERSE.practice}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={[styles.recentTitle, { color: colors.foreground }]}>
            Recent Words
          </Text>
          {RECENT_VERSES.map((v, i) => (
            <View
              key={i}
              style={[
                styles.recentCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.recentDate, { color: colors.mutedForeground }]}>
                {v.date}
              </Text>
              <Text style={[styles.recentVerse, { color: colors.foreground }]}>
                "{v.text}"
              </Text>
              <Text style={[styles.recentRef, { color: colors.primary }]}>
                {v.ref}
              </Text>
            </View>
          ))}
        </Animated.View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  mainCard: {
    borderRadius: 20,
    padding: 28,
  },
  dateLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 16,
  },
  mainVerse: {
    fontSize: 22,
    fontFamily: "Inter_500Medium",
    lineHeight: 34,
    fontStyle: "italic",
    marginBottom: 16,
  },
  mainRef: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  recentTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
    marginTop: 8,
  },
  recentCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  recentDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  recentVerse: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 6,
  },
  recentRef: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
