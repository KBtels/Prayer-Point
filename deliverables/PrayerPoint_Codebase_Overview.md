# Prayer Point — Codebase Overview (for Copilot / Investor Review)

A faith-based mobile prayer app. This document is a roadmap for an LLM (e.g. GitHub Copilot) to quickly orient itself in the source archive and produce an investor-grade summary.

## At a glance

| Item | Detail |
|---|---|
| Product | "Prayer Point" — a daily prayer, reflection, and meditation companion |
| Platforms | iOS + Android (Expo / React Native), shared TypeScript monorepo |
| Repo | https://github.com/KBtels/Prayer-Point |
| Brand color | Gold `#D4A843`, mark "P." |
| Storage | On-device AsyncStorage (key `god_first_state`) |
| Subscription | RevenueCat — entitlement `premium`, offering `premium_v4` ($8.50/mo, $79/yr) |
| Architecture | pnpm workspace monorepo with isolated artifacts |

## Repository layout

```
artifacts/
  mobile/               <- Expo React Native app (the product)
    app/                <- expo-router file-based routes
      (tabs)/           <- Home, Momentum, Profile
      onboarding.tsx    <- First-run flow
      pray.tsx          <- Quick prayer with categories
      breath.tsx        <- Breathwork meditation
      verse.tsx         <- Daily Bible verse
      reflection.tsx    <- Journaling
      subscribe.tsx     <- Paywall (RevenueCat)
    context/AppContext.tsx   <- Single source of truth for app state
    lib/                <- prayer generator, revenuecat wrapper, theme
    assets/             <- Icons, images, ambient videos
  api-server/           <- Optional Node/Express API (future server-side features)
  mockup-sandbox/       <- Internal design previewer (not shipped)
scripts/                <- One-off ops scripts (e.g. RevenueCat seeding)
deliverables/           <- QA brief, this overview
replit.md               <- Living architecture / decisions log
```

## Core features (where to look)

- **Onboarding** — `artifacts/mobile/app/onboarding.tsx`
- **Home + streak hero** — `artifacts/mobile/app/(tabs)/index.tsx`
- **Momentum analytics** (streak, longest, total, reflections, milestones, weekly chart, top categories, shared streaks) — `artifacts/mobile/app/(tabs)/momentum.tsx`
- **Quick prayer w/ categories** — `artifacts/mobile/app/pray.tsx` + `lib/prayerGenerator.ts`
- **Breathwork** (Stress / Anxiety / Uncertainty / Depression triggers) — `artifacts/mobile/app/breath.tsx`
- **Daily verse** — `artifacts/mobile/app/verse.tsx`
- **Reflections journal** — `artifacts/mobile/app/reflection.tsx`
- **Profile + in-app rating/review** — `artifacts/mobile/app/(tabs)/profile.tsx`
- **Paywall + savings badge** — `artifacts/mobile/app/subscribe.tsx`
- **Habit quotes rotation** — `artifacts/mobile/lib/habitQuotes.ts`

## State & persistence

Single React context (`AppContext`) hydrates from AsyncStorage on launch and writes-through on every mutation. No backend required for v1; all user data lives on-device.

## Monetization

- RevenueCat SDK (`artifacts/mobile/lib/revenuecat.tsx`) + project `proj8f714ceb`
- Active offering: `premium_v4` — `$rc_monthly` ($8.50) and `$rc_annual` ($79, badged "Save 23%")
- Free trials configured at the store level (App Store Connect / Play Console) at launch
- Bundle ID placeholder `com.prayerpoint.app` — to be replaced before submission

## What's intentionally not in this archive

- `node_modules/` (re-install via `pnpm install`)
- `.git/` history (live history is on GitHub)
- Raw `attached_assets/` source uploads (final used media is under `artifacts/mobile/assets`)
- Lockfile and build caches
- Any `.env` files / secrets

## Quick start for a reviewer

```bash
pnpm install
pnpm --filter @workspace/mobile run dev
```

Open Expo Go (or the Replit web preview) to load the app.

## Suggested investor-summary angles

1. **Market** — faith / wellness intersection; competitors: Hallow, Glorify, Pray.com
2. **Product wedge** — combines prayer + breathwork + reflection + streak gamification in one calm UI
3. **Business model** — RevenueCat-driven subscriptions with annual heavily discounted to drive LTV
4. **Tech leverage** — Expo monorepo means a single TypeScript codebase ships iOS + Android + future web
5. **Privacy posture** — on-device storage by default; no PII required to use the core product
