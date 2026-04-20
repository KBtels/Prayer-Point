# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts exec tsx src/seedRevenueCat.ts` — re-run RevenueCat seed (idempotent)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Subscriptions (RevenueCat)

- Project: "Prayer Point" (id stored in `REVENUECAT_PROJECT_ID`)
- Entitlement: `premium`
- Current offering: `premium_v4` with two packages: `$rc_monthly` ($8.50 USD) and `$rc_annual` ($79 USD, highlighted as "Best value"). The legacy `default` offering (ZAR weekly/monthly/annual) is retained but no longer current.
- Bundle id / package name: `com.prayerpoint.app` (placeholder — change before App Store / Play submission)
- Client SDK: `react-native-purchases` in `artifacts/mobile`; client wrapper at `artifacts/mobile/lib/revenuecat.tsx` exports `initializeRevenueCat`, `SubscriptionProvider`, `useSubscription`
- Server seed: `scripts/src/seedRevenueCat.ts` using `@replit/revenuecat-sdk` and the connector client at `scripts/src/revenueCatClient.ts`
- Env vars (shared): `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`, `REVENUECAT_PROJECT_ID`, `REVENUECAT_TEST_STORE_APP_ID`, `REVENUECAT_APPLE_APP_STORE_APP_ID`, `REVENUECAT_GOOGLE_PLAY_STORE_APP_ID`
- Free trials and a true 3-week cycle are not supported by App Store / Play Store; configure trials in App Store Connect / Play Console at launch.
- `AppContext.isSubscribed` is mirrored from RevenueCat by `SubscriptionSync` in `app/_layout.tsx` so existing gating still works.
