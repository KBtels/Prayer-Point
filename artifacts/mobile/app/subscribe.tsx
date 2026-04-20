import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { PurchasesPackage } from "react-native-purchases";

type TierMeta = {
  packageIdentifier: string;
  label: string;
  caption?: string;
  highlight?: boolean;
};

const TIER_META: TierMeta[] = [
  { packageIdentifier: "$rc_monthly", label: "Monthly" },
  { packageIdentifier: "$rc_annual", label: "Annual", caption: "Best value", highlight: true },
];

export default function SubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setSubscription } = useApp();
  const { currentOffering, purchase, restore, isPurchasing, isRestoring, isLoading } =
    useSubscription();

  const tiers = useMemo(() => {
    const packages = currentOffering?.availablePackages ?? [];
    return TIER_META
      .map((meta) => {
        const pkg = packages.find((p) => p.identifier === meta.packageIdentifier);
        if (!pkg) return null;
        return { ...meta, pkg };
      })
      .filter((t): t is TierMeta & { pkg: PurchasesPackage } => t !== null);
  }, [currentOffering]);

  const [selectedId, setSelectedId] = useState<string>(
    tiers.find((t) => t.highlight)?.packageIdentifier ?? tiers[0]?.packageIdentifier ?? "",
  );

  const topInset = Platform.OS === "web" ? 24 : insets.top;
  const bottomInset = Platform.OS === "web" ? 24 : insets.bottom;
  const gold = colors.goldGlow ?? "#D4A843";

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedId(id);
  };

  const handleStart = async () => {
    const tier = tiers.find((t) => t.packageIdentifier === selectedId);
    if (!tier) return;
    try {
      await purchase(tier.pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubscription(tier.pkg.product.identifier);
      router.back();
    } catch (err: any) {
      if (!err?.userCancelled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error("Purchase failed", err);
      }
    }
  };

  const handleRestore = async () => {
    Haptics.selectionAsync();
    try {
      await restore();
    } catch (err) {
      console.error("Restore failed", err);
    }
  };

  const handleLater = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const ctaLabel = isPurchasing ? "Processing..." : "Continue";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 24, paddingBottom: bottomInset + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleLater} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroIconWrap}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: gold + "1F", borderColor: gold + "55" },
            ]}
          >
            <Ionicons name="leaf" size={28} color={gold} />
          </View>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.duration(500).delay(80)}
          style={[styles.title, { color: colors.foreground }]}
        >
          Continue Your Journey
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.duration(500).delay(160)}
          style={[styles.subtitle, { color: colors.mutedForeground }]}
        >
          Consistency and community deepen prayer.{"\n"}
          Choose how you'd like to keep going — at your own pace.
        </Animated.Text>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={gold} />
          </View>
        ) : tiers.length === 0 ? (
          <View style={styles.loadingWrap}>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Plans are temporarily unavailable. Please try again shortly.
            </Text>
          </View>
        ) : (
          <View style={styles.tiers}>
            {tiers.map((tier, i) => {
              const isSelected = selectedId === tier.packageIdentifier;
              const priceString = tier.pkg.product.priceString;
              return (
                <Animated.View
                  key={tier.packageIdentifier}
                  entering={FadeInDown.duration(450).delay(220 + i * 70)}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleSelect(tier.packageIdentifier)}
                    style={[
                      styles.tier,
                      {
                        backgroundColor: colors.card,
                        borderColor: isSelected ? gold : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    {tier.highlight && (
                      <LinearGradient
                        colors={[gold + "18", "transparent"]}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                    <View style={styles.tierLeft}>
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: isSelected ? gold : colors.border,
                            backgroundColor: isSelected ? gold : "transparent",
                          },
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#0A0A14" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.tierLabel, { color: colors.foreground }]}>
                          {tier.label}
                        </Text>
                        {tier.caption && (
                          <Text
                            style={[
                              styles.tierCaption,
                              { color: tier.highlight ? gold : colors.mutedForeground },
                            ]}
                          >
                            {tier.caption}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={[styles.tierPrice, { color: colors.foreground }]}>
                      {priceString}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        <Animated.View entering={FadeIn.duration(500).delay(620)}>
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.9}
            disabled={isPurchasing || tiers.length === 0}
            style={[
              styles.cta,
              {
                backgroundColor: gold,
                opacity: isPurchasing || tiers.length === 0 ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.ctaText, { color: "#0A0A14" }]}>{ctaLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore} disabled={isRestoring} style={styles.restoreBtn}>
            <Text style={[styles.restoreText, { color: gold }]}>
              {isRestoring ? "Restoring..." : "Restore purchases"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLater} style={styles.laterBtn}>
            <Text style={[styles.laterText, { color: colors.mutedForeground }]}>
              Maybe later
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
            Cancel anytime in your App Store or Google Play account.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  closeBtn: { padding: 6 },
  heroIconWrap: { alignItems: "center", marginTop: 8, marginBottom: 18 },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  loadingWrap: { paddingVertical: 28, alignItems: "center" },
  tiers: { gap: 12, marginBottom: 28 },
  tier: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  tierLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  tierLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  tierCaption: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  tierPrice: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  cta: {
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  restoreBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  restoreText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  laterBtn: {
    paddingVertical: 8,
    alignItems: "center",
  },
  laterText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  disclaimer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
