# Prayer Point — QA Brief

**For:** Copilot / QA pass
**App:** Prayer Point (Expo / React Native mobile app)
**Repo:** https://github.com/KBtels/Prayer-Point.git (branch `main`)
**Latest commit:** `Integrate RevenueCat for in-app subscriptions and purchases`

---

## 1. Project layout (what's where)

This is a pnpm monorepo. The mobile app is the only user-facing artifact.

```
artifacts/
├── mobile/             ← the Prayer Point Expo app (the QA target)
│   ├── app/            ← all screens (expo-router file-based routing)
│   │   ├── (tabs)/     ← bottom-tab screens: home, streak, momentum, profile
│   │   ├── onboarding/ ← intro, name, age, pray-frequency, gratitude, belief
│   │   ├── _layout.tsx ← root layout — wires AppProvider + SubscriptionProvider
│   │   ├── index.tsx   ← onboarding gate / route into the app
│   │   ├── pray.tsx    ← Quick Prayer flow (categories → prayer → Amen)
│   │   ├── word.tsx    ← Daily Bible verse
│   │   ├── reflect.tsx ← Reflections journal entry
│   │   └── subscribe.tsx ← Paywall (real RevenueCat plans)
│   ├── context/AppContext.tsx ← AsyncStorage-backed app state (key: god_first_state)
│   └── lib/revenuecat.tsx     ← RevenueCat client wrapper + useSubscription hook
├── api-server/        ← scaffold only, not used by the mobile app
└── mockup-sandbox/    ← internal design tool, not user-facing
scripts/
├── src/revenueCatClient.ts   ← server-side RevenueCat API client
└── src/seedRevenueCat.ts     ← idempotent seed for products / offering / packages
```

**Brand:** "Prayer Point", logo "P." in gold (`#D4A843`). Background `#FBF7F0`.

---

## 2. Features built (and what to QA)

### 2.1 Onboarding
6 screens in order: Intro → Name → Age → Pray Frequency → Gratitude → Belief.
- **State to verify:** name and selections persist across reloads (AsyncStorage).
- **Edge cases:** skipping name, hitting back, force-quit mid-onboarding.
- **Done state:** sets `hasOnboarded = true` and routes to the tabs.

### 2.2 Tabs (bottom navigation, 4 tabs)
Order: **Home → Streak → Momentum → Profile**. Profile icon was removed from the home header.

### 2.3 Home
- Personalised greeting using user's name.
- Streak indicator.
- Quick-launch buttons: Quick Prayer, Daily Word, Reflect.
- Rotating daily habit quote.

### 2.4 Quick Prayer (`pray.tsx`)
- User picks one or more categories (e.g. Stress, Anxiety, Gratitude, Family, Uncertainty, Depression).
- A prayer is procedurally generated based on the selected categories.
- Tapping **Amen** records the prayer (`recordPrayer`) — this updates streak, total prayers, and per-day prayer log.
- **Breathwork trigger:** if categories include `Stress`, `Anxiety`, `Uncertainty`, or `Depression`, a breathwork meditation flow is offered.
- **Subscribe trigger:** the paywall pops up once, 1.2s after the user taps Amen on their **3rd ever prayer** (gated by `subscriptionPromptedAfterPrayer`). Verify it does NOT pop up again on prayer 4+.

### 2.5 Streak tab
- Hero "flame" card showing current streak / longest streak.
- "On Habit" rotating quote card (positioned **below** the flame hero).
- "Pray together" / friends list with "Invite a loved one" CTA.
- **Subscription gate:** non-subscribers tapping "Invite a loved one" should see the paywall. Subscribers go straight to the invite flow.

### 2.6 Momentum tab
- Prayer Momentum analytics: charts/visualisations of prayer logs over time, by category.
- Verify it stays empty-state-clean when there are 0 prayers.

### 2.7 Profile tab (was Settings)
- Avatar + name.
- Rate / review the app card (writes to `appRating` + `appReview`).
- **Get in touch with us** card → opens `mailto:hello@prayerpoint.app` via `Linking`. **Verify on a device — `mailto:` does not work in the web preview.**
- Subscription status display.

### 2.8 Subscription / Paywall (`subscribe.tsx`)
- Plans are pulled live from RevenueCat (no hardcoded prices).
  - **Weekly — ZAR 37.00** (`$rc_weekly`)
  - **Monthly — ZAR 55.00** (`$rc_monthly`)
  - **Annual — ZAR 630.00**, "Best value" highlight (`$rc_annual`)
- "Continue" calls `Purchases.purchasePackage`. On success, mirrors `isSubscribed = true` into `AppContext` via `SubscriptionSync`.
- "Restore purchases" → `Purchases.restorePurchases()` (required for App Store review).
- "Maybe later" closes the screen.
- User-cancelled purchases must NOT log an error toast.

### 2.9 Reflections (`reflect.tsx`)
- Free-text reflection + optional category tags.
- Saves to `AppContext.reflections` (AsyncStorage). Most-recent first.

### 2.10 Daily Word (`word.tsx`)
- Shows a Bible verse for the day. Verify the verse rotates day-to-day.

### 2.11 Breathwork
- Triggered from heavy-emotion categories.
- Animated inhale / hold / exhale loop.
- Verify the user can exit at any time without it crashing the prayer flow.

---

## 3. Known platform limits (please don't file as bugs)

1. **3-week subscription cycle is not supported** by Apple or Google. The closest standard cycle (weekly) was used at R37. To revisit later.
2. **Free trial tier was removed.** Trials have to be set up as Introductory Offers in App Store Connect / Google Play Console and don't work in RevenueCat's test store. The paywall will surface them automatically once they exist in production.
3. **`mailto:` won't open in the web preview.** Test on a real device or simulator.
4. **In-app purchases can't fully complete in the web preview / Expo Go.** RevenueCat runs in "Browser Mode" / "Preview API Mode" and mocks native calls. Real purchase flows must be tested with a TestFlight / internal-testing-track build.
5. **Bundle ID / Android package name are placeholders** (`com.prayerpoint.app`). They must be replaced with the customer's registered identifiers before store submission.

---

## 4. Test data / how to reach each screen

| Screen | How to get there |
|---|---|
| Onboarding | Fresh install, or clear app storage (`AsyncStorage` key `god_first_state`) |
| Home | After onboarding completes |
| Quick Prayer | Home → "Pray" button |
| Subscribe | Tap "Amen" on your 3rd prayer; OR Streak → "Invite a loved one" while not subscribed |
| Breathwork | Quick Prayer → pick Stress / Anxiety / Uncertainty / Depression |
| Profile | Bottom tab |
| Reflections | Home → "Reflect" or via tab navigation |
| Daily Word | Home → "Daily Word" |

To reset all state during QA: clear app storage, or reinstall.

---

## 5. Acceptance criteria summary

- [ ] Onboarding completes and survives reload.
- [ ] Streak increments correctly (+1 for consecutive days, resets on a missed day, no double-count for two prayers same day).
- [ ] 3rd-prayer paywall fires exactly once.
- [ ] Non-subscribers cannot invite a loved one without going through the paywall.
- [ ] Subscriber state persists across app launches (mirrored from RevenueCat).
- [ ] All four bottom tabs render without errors.
- [ ] Reflections list shows newest first and persists.
- [ ] Quick Prayer with no categories selected still produces a sensible prayer.
- [ ] No hardcoded prices anywhere in the paywall — they all match RevenueCat.
- [ ] "Restore purchases" is reachable on the paywall.

---

## 6. Environment / secrets (already configured in Replit)

These are stored as shared env vars on the Replit project — Copilot does not need to set them, but is listed here for reference:

- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- `REVENUECAT_PROJECT_ID`
- `REVENUECAT_TEST_STORE_APP_ID`
- `REVENUECAT_APPLE_APP_STORE_APP_ID`
- `REVENUECAT_GOOGLE_PLAY_STORE_APP_ID`
- `SESSION_SECRET`

---

## 7. How to run locally

```
pnpm install
pnpm --filter @workspace/mobile run dev    # Expo dev server
```

Re-seed RevenueCat (idempotent) if needed:
```
pnpm --filter @workspace/scripts exec tsx src/seedRevenueCat.ts
```

---

## 8. Source of truth

Everything is on `main` in https://github.com/KBtels/Prayer-Point.git — clone that repo to QA the exact code described above.
