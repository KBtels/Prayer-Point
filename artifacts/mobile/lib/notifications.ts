import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const REMINDER_CHANNEL = "prayer-reminders";

const PROMPTS: { title: string; body: string }[] = [
  { title: "Pause. Pray.", body: "He's listening. Take 30 seconds." },
  { title: "Step into His presence", body: "Trade the scroll for a quiet moment." },
  { title: "Be still", body: '"Be still, and know that I am God." — Psalm 46:10' },
  { title: "He's thinking of you", body: "Want to say something back?" },
  { title: "30 seconds with Him", body: "It resets everything." },
  { title: "A quiet word", body: '"Cast all your anxiety on him." — 1 Peter 5:7' },
  { title: "Take a breath", body: "Then take it to Him." },
  { title: "Don't lose the day", body: "One short prayer keeps the streak alive." },
];

export function pickPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

// Foreground behavior: show banner + sound
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: "Prayer Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      vibrationPattern: [0, 120, 80, 120],
      lightColor: "#D4A843",
    });
  }
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  await ensureAndroidChannel();
  const settings = await Notifications.getPermissionsAsync();
  if (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

function isInQuietHours(hour: number, quietStart: number, quietEnd: number) {
  if (quietStart === quietEnd) return false;
  if (quietStart < quietEnd) {
    return hour >= quietStart && hour < quietEnd;
  }
  // Overnight window (e.g. 22 → 7)
  return hour >= quietStart || hour < quietEnd;
}

/**
 * Schedule a recurring set of daily prayer reminders at the given interval,
 * skipping quiet hours. Cancels any previously scheduled reminders first.
 */
export async function scheduleReminders(opts: {
  intervalHours: number;
  quietStart: number;
  quietEnd: number;
}) {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { intervalHours, quietStart, quietEnd } = opts;
  if (intervalHours <= 0) return;

  const startHour = 0;
  for (let h = startHour; h < 24; h += intervalHours) {
    if (isInQuietHours(h, quietStart, quietEnd)) continue;
    const prompt = pickPrompt();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: prompt.title,
        body: prompt.body,
        sound: "default",
        data: { route: "/pray" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: 0,
        channelId: REMINDER_CHANNEL,
      },
    });
  }
}

export async function cancelAllReminders() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
