import RatingModal from "@/components/RatingModal";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
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
  const {
    name,
    age,
    prayFrequency,
    profileImage,
    setProfileImage,
    appRating,
    appReview,
    setAppRating,
  } = useApp();
  const [showRating, setShowRating] = useState(false);

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "We need access to your photos so you can pick a profile picture."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setProfileImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemoveImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProfileImage("");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url =
      "mailto:hello@prayerpoint.app?subject=Prayer%20Point%20Feedback";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Get in touch",
          "Email us at hello@prayerpoint.app and we'll get back to you."
        );
      }
    } catch {
      Alert.alert(
        "Get in touch",
        "Email us at hello@prayerpoint.app and we'll get back to you."
      );
    }
  };

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
          <TouchableOpacity
            onPress={handlePickImage}
            onLongPress={profileImage ? handleRemoveImage : undefined}
            activeOpacity={0.85}
            style={[
              styles.avatar,
              { backgroundColor: colors.goldGlow + "33" ?? "#D4A84333" },
            ]}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={[styles.avatarText, { color: colors.goldGlow ?? "#D4A843" }]}>
                {name ? name[0].toUpperCase() : "G"}
              </Text>
            )}
            <View
              style={[
                styles.avatarEdit,
                { backgroundColor: colors.goldGlow ?? "#D4A843" },
              ]}
            >
              <Feather name="camera" size={12} color="#0A0A14" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: colors.prayerText + "66" ?? "#E8D9B866" }]}>
            {profileImage ? "Tap to change · hold to remove" : "Tap to add a photo"}
          </Text>
          <Text style={[styles.profileName, { color: colors.prayerText ?? "#E8D9B8" }]}>
            {name || "Faithful One"}
          </Text>
          <Text style={[styles.profileSub, { color: colors.prayerText + "88" ?? "#E8D9B888" }]}>
            {age}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
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

        <Animated.View entering={FadeInDown.duration(500).delay(250)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Your Review
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowRating(true);
            }}
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border, padding: 18 },
            ]}
          >
            {appRating > 0 ? (
              <View>
                <View style={styles.reviewStarsRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= appRating ? "star" : "star-outline"}
                      size={20}
                      color={n <= appRating ? colors.goldGlow : colors.border}
                      style={{ marginRight: 4 }}
                    />
                  ))}
                  <Text style={[styles.reviewEdit, { color: colors.primary }]}>
                    Edit
                  </Text>
                </View>
                {appReview ? (
                  <Text style={[styles.reviewText, { color: colors.foreground }]}>
                    "{appReview}"
                  </Text>
                ) : (
                  <Text style={[styles.reviewText, { color: colors.mutedForeground, fontStyle: "italic" }]}>
                    Tap to add a few words about your experience.
                  </Text>
                )}
              </View>
            ) : (
              <View>
                <View style={styles.reviewStarsRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name="star-outline"
                      size={20}
                      color={colors.border}
                      style={{ marginRight: 4 }}
                    />
                  ))}
                </View>
                <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>
                  Rate Prayer Point and share what you think.
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(275)}>
          <TouchableOpacity
            style={[
              styles.contactCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={handleContact}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.contactIcon,
                { backgroundColor: (colors.goldGlow ?? "#D4A843") + "1F" },
              ]}
            >
              <Feather name="mail" size={18} color={colors.goldGlow ?? "#D4A843"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactTitle, { color: colors.foreground }]}>
                Get in touch with us
              </Text>
              <Text
                style={[styles.contactSubtitle, { color: colors.mutedForeground }]}
              >
                Questions, prayer requests, or feedback — we'd love to hear from you.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(325)}>
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

      <RatingModal
        visible={showRating}
        initialRating={appRating}
        initialReview={appReview}
        title={appRating > 0 ? "Update your review" : "Rate Prayer Point"}
        subtitle="Your feedback helps us shape Prayer Point for you."
        submitLabel={appRating > 0 ? "Save" : "Submit"}
        onClose={() => setShowRating(false)}
        onSubmit={(r, rev) => {
          setAppRating(r, rev);
          setShowRating(false);
        }}
      />
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
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
  },
  avatarEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0A0A14",
  },
  avatarHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
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
  reviewStarsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewEdit: {
    marginLeft: "auto",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  reviewText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
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
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
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
