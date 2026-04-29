# Threat Model

## Project Overview

Prayer Point is a TypeScript pnpm monorepo with a small Express 5 API server (`artifacts/api-server`) and an Expo React Native/mobile-web client (`artifacts/mobile`). The production backend currently exposes a health endpoint and an audio transcription endpoint backed by OpenAI. The mobile web build also has a standalone static server (`artifacts/mobile/server/serve.js`) that serves a landing page and Expo manifest. The mobile app stores most user state locally in AsyncStorage and uses RevenueCat for subscription status.

Production scope assumptions for this repository:
- `artifacts/api-server` and `artifacts/mobile` are production-relevant.
- `artifacts/mockup-sandbox` is dev-only and should be ignored unless production reachability is demonstrated.
- Local build scripts under mobile are primarily developer tooling unless they are part of the deployed serving path.
- Replit handles TLS for deployed traffic.

## Assets

- **OpenAI API credentials and paid transcription capacity** -- compromise or abuse would let attackers consume paid API quota and generate cost.
- **User audio reflections and transcribed text** -- these may contain sensitive personal or spiritual journal content and should not be exposed to other users or unnecessary parties.
- **Subscription entitlements and usage limits** -- premium/unlimited voice features are business-sensitive and must be enforced by a trusted system, not only by client state.
- **Application availability** -- the transcription endpoint is the main expensive backend surface and is susceptible to abuse if not authenticated, authorized, and rate-limited.
- **Local user state on device** -- onboarding state, reflections, reminders, and subscription mirror values live in AsyncStorage and are inherently user-controlled.

## Trust Boundaries

- **Mobile/Web client to API server** -- all requests to `/api/*` originate from an untrusted client and require server-side validation, authentication, and abuse controls.
- **API server to OpenAI** -- the server holds the OpenAI key and can spend money or forward user content to the external AI service.
- **Client local storage to client UI** -- AsyncStorage values are fully attacker-controlled on a rooted device, emulator, or modified web client; they cannot be trusted for security enforcement.
- **RevenueCat entitlement service to client UI** -- RevenueCat is the source of truth for subscriptions, but any local mirrored entitlement state is only advisory unless revalidated by a trusted backend.
- **Dev-only tooling to production** -- mockup sandbox and build scripts are out of scope unless evidence shows they are reachable in production.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/mobile/app/_layout.tsx`, `artifacts/mobile/app/index.tsx`, `artifacts/mobile/server/serve.js`
- **Highest-risk code areas**: `artifacts/api-server/src/routes/transcribe.ts`, `artifacts/mobile/lib/transcribe.ts`, `artifacts/mobile/context/AppContext.tsx`, `artifacts/mobile/lib/revenuecat.tsx`, `artifacts/mobile/server/templates/landing-page.html`
- **Public surface**: `/api/healthz`, `/api/transcribe`, mobile onboarding and app routes
- **Authenticated/admin surface**: none currently enforced server-side
- **Usually dev-only**: `artifacts/mockup-sandbox/**`, `artifacts/mobile/scripts/**` unless production reachability is shown

## Threat Categories

### Spoofing

The current backend does not establish user identity for API calls. Any production endpoint that spends money, accesses user content, or grants premium functionality must require a trustworthy server-validated identity or other strong caller authentication. Client-local onboarding or subscription flags do not satisfy this guarantee.

### Tampering

The client controls request bodies, uploaded filenames, MIME types, and all locally persisted state. The API must validate uploaded content and enforce business rules server-side. Premium limits, free-tier quotas, and similar controls must not depend solely on AsyncStorage or client-side UI checks.

### Information Disclosure

Audio reflections and transcripts may contain highly sensitive personal content. The server must minimize logging, avoid echoing unnecessary internal errors, and only disclose transcript data to the caller who is authorized to receive it. Secrets such as OpenAI credentials must never be exposed to clients or logs.

### Denial of Service

The transcription route is the primary expensive public surface. It must enforce authentication and meaningful rate, size, and concurrency limits so unauthenticated attackers cannot repeatedly upload files and exhaust memory, worker capacity, or paid OpenAI quota.

### Elevation of Privilege

If premium voice journaling is a paid capability, entitlement checks must be enforced by a trusted backend component. Otherwise any attacker can bypass client-side restrictions and obtain premium-grade service by calling the backend directly. Any future privileged routes must also enforce authorization server-side rather than in the mobile UI.
