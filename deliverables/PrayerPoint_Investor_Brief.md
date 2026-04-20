# Prayer Point — Investor Brief

*Prepared April 2026*

---

## 1. Executive summary

**Prayer Point** is a mobile-first prayer, reflection, and meditation companion for people of faith. It blends the daily-habit mechanics of consumer wellness apps (Calm, Headspace) with the spiritual anchoring of leading faith apps (Hallow, Glorify, Pray.com) — wrapped in a calm, premium, gold-on-cream aesthetic.

The product is built, in TestFlight-readiness state, and monetizes through a RevenueCat-managed subscription at **$8.50 / month** or **$79 / year** (annual saves 23%). The codebase is a single TypeScript / Expo monorepo, meaning one team ships iOS, Android, and (later) web from the same source.

We are raising to fund **content, growth, and platform expansion** — not core engineering — because the v1 product is already shipped.

---

## 2. The problem

Faith and mental wellness are two of the largest, most under-served digital categories:

- **~85% of the global population** identifies with a religion; roughly **2.4 billion** identify as Christian alone.
- Yet the daily spiritual practice of most believers is fragmented: a Bible app for reading, a notes app for journaling, a meditation app for calm, and nothing tying them together.
- Mainstream wellness apps strip out the spiritual layer. Mainstream Bible apps under-invest in habit and emotional-state design.

The result: believers either feel guilty for using "secular" wellness tools, or bounce between four apps and lose the daily streak that actually changes behavior.

---

## 3. The product

Prayer Point is a single, calm space that covers the four micro-moments of a daily faith practice:

| Moment | Feature |
|---|---|
| "I want to pray right now" | **Quick Prayer** — pick a category (gratitude, family, work, health, guidance, etc.) and receive a procedurally generated prayer in seconds |
| "I'm anxious / stressed / uncertain" | **Breathwork** — guided breathing tied to four emotional triggers (Stress, Anxiety, Uncertainty, Depression) |
| "I want a word for today" | **Daily Bible Verse** — rotating scripture with reflection prompt |
| "I want to process my day" | **Reflections Journal** — private, on-device journaling |

Surrounding these are the habit-engine features:

- **Streak tracking** with a flame hero, longest streak, lifetime totals, and milestone unlocks (3 / 7 / 14 / 30 / 60 days)
- **Prayer Momentum** analytics — weekly chart, last-30-days active days, top categories prayed about, shared streaks
- **Rotating habit quotes** ("On Habit") to reinforce identity
- **In-app rating prompt** to drive 5-star App Store reviews at peak emotional moments

The brand is intentionally restrained — a single gold accent (`#D4A843`) on cream, with a "P." mark — to feel premium and non-denominational rather than kitschy.

---

## 4. Why now

1. **Faith-tech has been validated.** Hallow crossed $100M in cumulative revenue, raised from venture (incl. Peter Thiel and Kennedy clan), and topped the App Store charts. Glorify raised $40M+. The category is no longer speculative.
2. **Most incumbents are denomination-locked.** Hallow is Catholic-first. Glorify leans Evangelical. There is room for a denomination-neutral, design-first alternative.
3. **The "wellness × faith" wedge is empty.** No leading faith app integrates breathwork at the level a Calm user expects. We do.
4. **Distribution costs are at a cyclical low.** App-install costs in faith verticals are still well below fitness or finance, allowing for efficient early acquisition.

---

## 5. Market

- **TAM (global believers using a smartphone):** ~3B people
- **SAM (English-speaking, paying-app-tolerant):** ~250M
- **SOM (5-year capture target):** ~2M paying subscribers

At a blended ARPU of ~$60/year (mix of monthly and annual), 2M subs = **$120M ARR**. Hallow's reported metrics already place that bar at "achievable, not aspirational" for a #2 player.

---

## 6. Business model

- **Freemium with premium subscription** (RevenueCat-managed)
- **Pricing:** $8.50 / month OR $79 / year (annual presented with a dynamically calculated "Save 23%" gold badge)
- **Free trial** to be configured at the App Store / Play Console level at launch
- **Free tier:** core prayer + verse access with daily limits, full streak tracking
- **Premium tier:** unlimited prayers, breathwork library, advanced Momentum analytics, reflection export

### Unit economics (illustrative, to be validated post-launch)

| Metric | Assumption |
|---|---|
| Blended ARPU | $60 / year |
| Gross margin (post Apple/Google + RevenueCat) | ~70% |
| Target CAC (year 1) | $15–25 |
| Implied LTV / CAC | 3x–4x at 18-month average tenure |

---

## 7. Technology

A modern, single-codebase stack chosen for shipping speed and long-term maintainability.

- **Framework:** Expo + React Native (TypeScript) — one codebase, two stores
- **Architecture:** pnpm workspace monorepo with isolated artifacts (mobile app, optional API server, internal design sandbox)
- **State:** Single React context (`AppContext`) hydrated from on-device AsyncStorage — *no backend required for v1*, which keeps cost-per-user near zero and dramatically simplifies privacy
- **Subscriptions:** RevenueCat SDK with offering `premium_v4` and entitlement `premium`
- **CI / source of truth:** GitHub (`KBtels/Prayer-Point`)
- **Build & deploy:** Replit-hosted dev environment; Expo Application Services (EAS) for store builds

### What this buys us

- **One engineer can keep two platforms current.** No native iOS/Android team needed at this stage.
- **Backend can be added later, on demand** (sharing, friends, server-driven content) without re-architecting v1.
- **Privacy is a differentiator, not a liability.** Because user data lives on-device by default, we have a clean story for App Store reviews and for parents giving the app to teens.

---

## 8. Roadmap

### Now (v1, shipped)
Onboarding, Home, Quick Prayer, Breathwork, Daily Verse, Reflections, Momentum analytics, Profile + rating, RevenueCat paywall, streak engine.

### Next 90 days
- App Store + Play Store submission (bundle ID promotion, store assets, intro pricing)
- Push-notification engine (smart prayer reminders tied to user pray-frequency)
- Expanded prayer category library and breathwork tracks
- Onboarding A/B framework

### 6–12 months
- Lightweight server-side account sync (optional, opt-in)
- Shared streaks with friends / family
- Seasonal content drops (Lent, Advent, Ramadan-equivalents per faith)
- Apple Watch companion for breathwork
- Spanish + Portuguese localization

### 12–24 months
- Web companion (same TypeScript codebase via Expo Web)
- Group / parish / small-group plans
- Content partnerships with pastors and faith creators

---

## 9. Competitive landscape

| App | Positioning | Where Prayer Point wins |
|---|---|---|
| **Hallow** | Catholic-first, audio-led | We are denomination-neutral; lighter-weight; design-forward |
| **Glorify** | Evangelical, daily devotionals | We integrate breathwork + journaling natively |
| **Pray.com** | Audio Bible + sleep stories | We are habit-engine first, not content-library first |
| **Calm / Headspace** | Secular meditation | We give believers a guilt-free home for the same habit |
| **YouVersion Bible** | Free reading app | We monetize, and we own the *practice* not the *text* |

---

## 10. Team & operating posture

- Lean, founder-led product and engineering (currently)
- Replit + GitHub workflow allows shipping multiple times per day without a release engineer
- Codebase is documented (`replit.md`, codebase overview) so a new engineer can be productive on day one
- Use of RevenueCat, Expo, and AsyncStorage means we have **zero recurring infra cost per user** at v1 scale

---

## 11. The ask

We are raising **a pre-seed / seed round** to fund:

1. **Content** — a faith-content lead and rolling pastor / theologian advisors to expand the prayer + breathwork library
2. **Growth** — paid acquisition experiments across Meta, TikTok, and faith-publisher partnerships
3. **iOS / Android polish** — store optimization, push infrastructure, and the first server-side features
4. **Localization** — Spanish first, Portuguese second

The product risk is already retired. The remaining risk is *distribution and content depth* — both of which are capital-efficient to solve.

---

## 12. Appendix — proof points for diligence

- **Live source:** https://github.com/KBtels/Prayer-Point
- **Source archive (62 MB, no node_modules / lockfile / secrets):** `PrayerPoint_Source.tar.gz`
- **Codebase overview for technical reviewers:** `PrayerPoint_Codebase_Overview.md`
- **QA brief:** `deliverables/PrayerPoint_QA_Brief.md`
- **Architecture / decisions log:** `replit.md` at the repo root

Suggested due-diligence questions a technical reviewer should answer from the source:

1. Is the state model coherent and serializable? (See `artifacts/mobile/context/AppContext.tsx`)
2. Is the subscription flow correctly wired and resilient to RevenueCat outages? (See `artifacts/mobile/lib/revenuecat.tsx` and `app/subscribe.tsx`)
3. Is the streak / momentum logic correct across day boundaries and time-zones? (See `app/(tabs)/momentum.tsx` and the streak helpers in context)
4. Are there any data-leak vectors? (Should find: none — all PII is local AsyncStorage)
5. Is the codebase structured to add a backend without rewriting? (Yes — `artifacts/api-server` is already scaffolded)

---

*All financial figures in this brief are illustrative and based on publicly reported industry benchmarks. Actual unit economics will be confirmed post-launch.*
