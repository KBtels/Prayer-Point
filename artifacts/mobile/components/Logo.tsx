import { useColors } from "@/hooks/useColors";
import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

type Props = {
  size?: number;
  color?: string;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
  showWordmark?: boolean;
  wordmarkColor?: string;
};

/**
 * Prayer Point logo: "P." where the period is in the fire/gold color.
 * Optionally renders the full "Prayer Point" wordmark beside the mark.
 */
export function Logo({
  size = 40,
  color,
  dotColor,
  style,
  showWordmark = false,
  wordmarkColor,
}: Props) {
  const colors = useColors();
  const fire = dotColor ?? colors.goldGlow ?? "#D4A843";
  const letterColor = color ?? colors.foreground;
  const wmColor = wordmarkColor ?? letterColor;

  const letterStyle: TextStyle = {
    fontSize: size,
    lineHeight: size * 1.05,
    color: letterColor,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  };
  const dotStyle: TextStyle = {
    fontSize: size,
    lineHeight: size * 1.05,
    color: fire,
    fontFamily: "Inter_700Bold",
  };

  return (
    <View style={[styles.row, style]}>
      <View style={styles.markRow}>
        <Text style={letterStyle}>P</Text>
        <Text style={dotStyle}>.</Text>
      </View>
      {showWordmark && (
        <Text
          style={{
            fontSize: size * 0.4,
            color: wmColor,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: 0.5,
            marginLeft: size * 0.3,
          }}
        >
          Prayer Point
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  markRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
});
