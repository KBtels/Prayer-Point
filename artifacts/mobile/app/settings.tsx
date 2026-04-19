import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { name, age, prayFrequency, streak, totalPrayers } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleReset = () => {
    Alert.alert(
      "Reset App",
      "This will erase all your data and restart the app. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await AsyncStorage.clear();
            router.replace("/onboarding/intro");
          },
        },
      ]
    );
  };

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
          Profile
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
            styles.profileCard,
            { backgroundColor: colors.prayerBg ?? "#0A0A14" },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.goldGlow + "33" ?? "#D4A84333" },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.goldGlow ?? "#D4A843" }]}>
              {name ? name[0].toUpperCase() : "G"}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.prayerText ?? "#E8D9B8" }]}>
            {name || "Faithful One"}
          </Text>
          <Text style={[styles.profileSub, { color: colors.prayerText + "88" ?? "#E8D9B888" }]}>
            {age}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.statsRow}
        >
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {streak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Day Streak
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {totalPrayers}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Prayers
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            About You
          </Text>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <InfoRow
              label="Name"
              value={name || "—"}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow
              label="Age Group"
              value={age || "—"}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow
              label="Prayer Habit"
              value={prayFrequency || "—"}
              colors={colors}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: colors.destructive }]}
            onPress={handleReset}
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
            <Text style={[styles.resetBtnText, { color: colors.destructive }]}>
              Reset & Start Over
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>
        {value}
      </Text>
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
  profileCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  profileSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 8,
  },
  resetBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
