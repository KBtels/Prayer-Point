import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  initialRating?: number;
  initialReview?: string;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
};

export default function RatingModal({
  visible,
  initialRating = 0,
  initialReview = "",
  title = "How are we doing?",
  subtitle = "Your feedback helps us shape Prayer Point for you.",
  submitLabel = "Submit",
  onClose,
  onSubmit,
}: Props) {
  const colors = useColors();
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);

  useEffect(() => {
    if (visible) {
      setRating(initialRating);
      setReview(initialReview);
    }
  }, [visible, initialRating, initialReview]);

  const gold = colors.goldGlow ?? "#D4A843";
  const canSubmit = rating > 0;

  const handleStar = (n: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(n);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(rating, review.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card ?? "#FFFFFF",
              borderColor: (colors.border ?? "#E5DCC8") + "AA",
            },
          ]}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.mutedForeground ?? "#998877"} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text ?? "#1a1209" }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground ?? "#7a6f5a" }]}>
            {subtitle}
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => handleStar(n)}
                style={styles.starBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={n <= rating ? "star" : "star-outline"}
                  size={36}
                  color={n <= rating ? gold : (colors.border ?? "#C8B894")}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Tell us what you love (optional)"
            placeholderTextColor={(colors.mutedForeground ?? "#998877") + "99"}
            multiline
            maxLength={240}
            style={[
              styles.input,
              {
                color: colors.text ?? "#1a1209",
                borderColor: (colors.border ?? "#E5DCC8"),
                backgroundColor: (colors.background ?? "#FBF7F0"),
              },
            ]}
          />

          <TouchableOpacity
            disabled={!canSubmit}
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={[
              styles.submitBtn,
              {
                backgroundColor: canSubmit ? gold : (colors.border ?? "#E5DCC8"),
              },
            ]}
          >
            <Text
              style={[
                styles.submitText,
                { color: canSubmit ? "#0A0A14" : (colors.mutedForeground ?? "#998877") },
              ]}
            >
              {submitLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
            <Text style={[styles.laterText, { color: colors.mutedForeground ?? "#998877" }]}>
              Maybe later
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10,10,20,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  starBtn: {
    padding: 4,
  },
  input: {
    minHeight: 80,
    maxHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
    marginBottom: 16,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  submitText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  laterBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  laterText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
