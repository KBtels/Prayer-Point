import { HabitQuote } from "@/constants/quotes";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

let shownThisSession = false;

export function hasShownQuoteThisSession() {
  return shownThisSession;
}

export function markQuoteShownThisSession() {
  shownThisSession = true;
}

type Props = {
  visible: boolean;
  quote: HabitQuote;
  onClose: () => void;
};

export default function HabitQuoteModal({ visible, quote, onClose }: Props) {
  const colors = useColors();
  const gold = colors.goldGlow ?? "#D4A843";

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View
          entering={FadeInDown.duration(450)}
          style={[
            styles.card,
            {
              backgroundColor: colors.prayerBg ?? "#0A0A14",
              borderColor: gold + "33",
            },
          ]}
        >
          <LinearGradient
            colors={[gold + "22", "transparent"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={(colors.prayerText ?? "#E8D9B8") + "AA"} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, { backgroundColor: gold + "22", borderColor: gold + "55" }]}>
              <Ionicons name="sparkles" size={22} color={gold} />
            </View>
          </View>

          <Text style={[styles.eyebrow, { color: gold }]}>On Habit</Text>

          <Animated.Text
            entering={FadeIn.duration(600).delay(150)}
            style={[styles.quote, { color: colors.prayerText ?? "#E8D9B8" }]}
          >
            "{quote.text}"
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.duration(600).delay(300)}
            style={[styles.author, { color: (colors.prayerText ?? "#E8D9B8") + "AA" }]}
          >
            — {quote.author}
          </Animated.Text>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.cta, { backgroundColor: gold }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, { color: "#0A0A14" }]}>
              Begin
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5,5,12,0.75)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 28,
    paddingTop: 32,
    borderWidth: 1,
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 2,
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 16,
  },
  quote: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 14,
  },
  author: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.4,
    marginBottom: 24,
  },
  cta: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
});
