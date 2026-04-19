import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
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

export default function ReflectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reflections, addReflection } = useApp();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = () => {
    if (text.trim().length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addReflection(text.trim(), []);
    setText("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          Reflections
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={[styles.inputSection, { borderBottomColor: colors.border }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What is God speaking to you about today?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.input,
            { color: colors.foreground, borderColor: colors.border },
          ]}
        />
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: saved ? colors.accent : colors.primary,
              opacity: text.trim().length === 0 ? 0.5 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={text.trim().length === 0}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            {saved ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {reflections.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.empty}>
          <Ionicons name="book-outline" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
            No reflections yet
          </Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            Write your first reflection above.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={reflections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: bottomInset + 40 },
          ]}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(400).delay(index * 60)}>
              <View
                style={[
                  styles.reflectionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.reflectionDate, { color: colors.mutedForeground }]}
                >
                  {formatDate(item.date)}
                </Text>
                <Text style={[styles.reflectionText, { color: colors.foreground }]}>
                  {item.text}
                </Text>
              </View>
            </Animated.View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </KeyboardAvoidingView>
  );
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
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
  inputSection: {
    padding: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  input: {
    minHeight: 100,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  list: {
    padding: 20,
    gap: 12,
  },
  reflectionCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  reflectionDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
});
