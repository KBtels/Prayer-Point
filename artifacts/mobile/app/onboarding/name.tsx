import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { name, setName } = useApp();
  const inputRef = useRef<TextInput>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleContinue = () => {
    if (name.trim().length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/onboarding/age");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.inner,
          { paddingTop: topInset + 32, paddingBottom: bottomInset + 24 },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={[styles.step, { color: colors.mutedForeground }]}>
            1 of 5
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            What's your name?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We'd love to greet you personally.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.inputArea}
        >
          <TouchableOpacity
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: name.length > 0 ? colors.primary : colors.border,
              },
            ]}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleContinue}
            />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          {name.trim().length > 0 && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={handleContinue}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                  Continue
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.primaryForeground}
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28 },
  step: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  inputArea: { marginTop: 48 },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  input: {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
  },
  footer: { marginTop: "auto" as const, paddingTop: 32 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  btnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
