import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
import {
  SubscriptionProvider,
  initializeRevenueCat,
  useSubscription,
} from "@/lib/revenuecat";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

try {
  initializeRevenueCat();
} catch (err: any) {
  Alert.alert("RevenueCat Unavailable", err?.message ?? "Unknown error");
}

function SubscriptionSync() {
  const { isSubscribed, customerInfo } = useSubscription();
  const { setSubscription, isSubscribed: localIsSubscribed } = useApp();

  useEffect(() => {
    if (isSubscribed && !localIsSubscribed) {
      const activeEntitlements = customerInfo?.entitlements.active;
      const tier = activeEntitlements
        ? Object.values(activeEntitlements)[0]?.productIdentifier ?? "premium"
        : "premium";
      setSubscription(tier);
    }
  }, [isSubscribed, localIsSubscribed, customerInfo, setSubscription]);

  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/intro" />
      <Stack.Screen name="onboarding/name" />
      <Stack.Screen name="onboarding/age" />
      <Stack.Screen name="onboarding/pray-frequency" />
      <Stack.Screen name="onboarding/gratitude" />
      <Stack.Screen name="onboarding/belief" />
      <Stack.Screen name="pray" />
      <Stack.Screen name="word" />
      <Stack.Screen name="reflect" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <SubscriptionProvider>
              <SubscriptionSync />
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </SubscriptionProvider>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
