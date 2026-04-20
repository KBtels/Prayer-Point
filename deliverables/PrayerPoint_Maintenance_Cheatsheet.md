# Prayer Point — Solo Maintenance Cheat Sheet

*How to ship updates, handle store reviews, and keep the lights on — without a developer.*

---

## TL;DR (the 30-second version)

| Need | Where you go |
|---|---|
| Tiny copy / color / quote change | **github.com → edit file → commit** |
| New feature or bug fix | Replit Agent session |
| New build for the App Store / Play Store | One terminal command: `eas build --platform all` |
| Push it live | One terminal command: `eas submit --platform all` |
| Apple/Google emailed about a policy change | Read it, then run a fresh build with the latest Expo SDK |

You do not need a server. You do not need a database. You do not need a CI pipeline. The whole stack is built to be run by one person on a laptop.

---

## 0. One-time setup (do this once, never again)

### Accounts
1. **Apple Developer Program** — https://developer.apple.com/programs/ — $99/year
2. **Google Play Console** — https://play.google.com/console — $25 one-time
3. **Expo account** — https://expo.dev — free, sign in with GitHub
4. **RevenueCat account** — https://app.revenuecat.com — already set up

### Tools on your laptop
```bash
# Install Node + pnpm + the Expo CLI tools
brew install node pnpm                          # macOS (or use nodejs.org on Windows)
npm install -g eas-cli

# Clone your repo and install
git clone https://github.com/KBtels/Prayer-Point.git
cd Prayer-Point
pnpm install

# Log into Expo
eas login
```

### Replace the placeholder bundle ID (one time, before first store submission)
Open `artifacts/mobile/app.json` and change `com.prayerpoint.app` to the bundle ID you registered with Apple and Google. Commit and push.

---

## 1. Tiny edits — never leave the browser

For things like: changing a prayer quote, swapping a color, fixing a typo, adding a new category name.

1. Go to **github.com/KBtels/Prayer-Point**
2. Navigate to the file (e.g. `artifacts/mobile/lib/habitQuotes.ts`)
3. Click the pencil icon (top right of the file view)
4. Make your change
5. Scroll down, write a short commit message, click **Commit changes**

That's it. The change is saved. The next time you build, it's in the app.

**Common files you'll edit this way:**

| What you want to change | File |
|---|---|
| Habit quotes | `artifacts/mobile/lib/habitQuotes.ts` |
| Daily Bible verses | `artifacts/mobile/lib/verses.ts` (or wherever your verses live) |
| Prayer categories | `artifacts/mobile/lib/prayerGenerator.ts` |
| Brand color | `artifacts/mobile/lib/theme.ts` (search for `#D4A843`) |
| Subscription pricing copy | `artifacts/mobile/app/subscribe.tsx` |
| App name / tagline | `artifacts/mobile/app.json` |

---

## 2. Shipping a build to the App Store + Play Store

After any change — whether you made it on github.com or with the Agent — here is the entire release flow.

### Step 1 — Pull the latest code
```bash
cd Prayer-Point
git pull
pnpm install        # only needed if dependencies changed
```

### Step 2 — Bump the version
Open `artifacts/mobile/app.json`, find `"version"`, and bump it (e.g. `1.0.3` → `1.0.4`). Commit + push.

### Step 3 — Build (this is the magic command)
```bash
cd artifacts/mobile
eas build --platform all
```

This kicks off a build on Expo's servers for **both iOS and Android in parallel**. Takes ~15–25 minutes. You can close your laptop and come back. You'll get an email when it's done.

The first time you run this, EAS will ask a few questions (signing keys, bundle IDs). Say yes to defaults — Expo manages everything for you.

### Step 4 — Submit to the stores
```bash
eas submit --platform all
```

This uploads the finished builds to App Store Connect and Google Play Console for you. Another ~5 minutes.

### Step 5 — Click "Submit for Review" in each store
- **App Store Connect:** https://appstoreconnect.apple.com → your app → TestFlight or "Prepare for Submission" → fill in any "what's new" notes → Submit
- **Google Play Console:** https://play.google.com/console → your app → Production → Create release → Review release → Roll out

Apple review takes 24–48 hours typically. Google is usually same-day.

---

## 3. When Apple or Google emails you

You will get emails. Most are routine. Here is the decoder ring:

| Email subject contains... | What it means | What to do |
|---|---|---|
| "Your app has been approved" | You're live | Celebrate |
| "Your subscription was renewed" | Apple Dev / Google Play fee | Pay it, nothing else |
| "Action required: SDK version X is required by [date]" | You must update Expo SDK before that date | Schedule 1 hour, see "Yearly maintenance" below |
| "Your app was rejected" | Reviewer flagged something | Read carefully, the message tells you exactly what to fix. Most rejections are screenshot or copy issues, not code. |
| "Your subscription product was disapproved" | Issue in your RevenueCat / store product setup | Log into App Store Connect, fix the description, resubmit |
| Anything about "ITMS-9000X" or crash reports | Genuine code issue | Time for an Agent session |

---

## 4. Yearly maintenance (1–2 hours, once a year)

Expo SDK has yearly major versions. When Apple/Google demand a newer iOS/Android target, you bump SDK. Here is the entire flow:

```bash
cd Prayer-Point/artifacts/mobile
npx expo install --fix              # auto-updates Expo + dependencies to latest compatible versions
pnpm install
npx expo prebuild --clean           # regenerates native folders (only if you have them)
eas build --platform all
eas submit --platform all
```

If anything breaks or you see red error messages: that's an Agent session. Don't try to debug it manually — you'll spend 4 hours on something an Agent fixes in 10 minutes.

---

## 5. RevenueCat / subscription maintenance

You will rarely touch this. The two scenarios:

**Scenario A: You want to change a price.**
RevenueCat test/sandbox prices are immutable — you must create a *new* product (e.g. `prayerpoint_monthly_v5`), wire it up in the RevenueCat dashboard, and ship a new app build. This is an Agent task, not a self-serve task.

**Scenario B: You want to add a free trial.**
Configure it in **App Store Connect** (Subscriptions → Your product → Add Introductory Offer) and **Play Console** (Monetize → Subscriptions → Add base offer). RevenueCat picks it up automatically. No code changes.

---

## 6. When to fire up an Agent (and when not to)

### ✅ Worth an Agent session
- Adding a new feature or screen
- Fixing a crash report from the stores
- Yearly Expo SDK upgrade *if* it breaks
- Changing subscription pricing / adding a new tier
- Setting up push notifications
- Localization to a new language

### ❌ Not worth an Agent session
- Fixing a typo (use github.com)
- Changing a color (use github.com)
- Adding a new prayer quote (use github.com)
- Reading App Store rejection emails (read them yourself first)
- Looking at analytics in RevenueCat (it's a dashboard, not code)

### How to start an Agent session efficiently
1. Open Replit, open this project
2. **Write your full request in one paragraph** before you start. Vague requests cost more iterations.
3. When done, close the session. You don't pay between sessions.

---

## 7. Emergency contacts (built-in, free)

| Problem | Where to look |
|---|---|
| Build failing on EAS | https://expo.dev/accounts/[you]/projects/prayer-point/builds — click the failed build, read the log |
| App crashing in production | App Store Connect → Analytics → Crashes  /  Play Console → Quality → Android vitals |
| Subscriptions not working | RevenueCat dashboard → Customers → search by user ID → see their entitlement state |
| Repo questions | https://github.com/KBtels/Prayer-Point — your `replit.md` is the project memory |

---

## 8. The honest cost picture

| Cost | Amount | Frequency |
|---|---|---|
| Apple Developer | $99 | Yearly |
| Google Play | $25 | One-time |
| Expo EAS Free Tier | $0 | Covers ~30 builds/month, more than enough |
| RevenueCat | $0 | Until you exceed $2,500/mo in revenue |
| GitHub | $0 | Personal repos are free |
| Replit | Free tier or pay-as-you-go | Only when actively developing |
| **Steady state** | **~$8/month** | (just Apple Dev amortized) |

Once the app is shipped, you can run it on **less than a Netflix subscription per month** until you're earning real revenue.

---

*Print this. Pin it to your wall. You've got everything you need.*
