# Development Notes

Working notes for the World Explorer build: decisions made, assumptions taken, and
open questions to resolve. The product source of truth is [`docs/PRD.md`](docs/PRD.md).

## Phase status

| Phase | Status |
| --- | --- |
| 0 Foundation | ✅ Complete |
| 1 Content (50-country slice) | ✅ Complete |
| 2 Map | ✅ Complete |
| 3 Game engine | ✅ Complete |
| 4 Games | ✅ Complete |
| 5 Progress | ✅ Complete |
| 6 Offline/PWA | ⏳ Next — 🟡 manifest + service worker; content precached |
| 7 QA | ⬜ Not started |

## Games (Phase 4)

- `QuizScreen` (`src/features/games/QuizScreen.tsx`) is a single engine-driven
  screen serving all six modes plus the daily challenge (`/play/:mode`, where
  `:mode` may be `daily`). It builds a session with the adaptive selector, shows a
  progress bar, renders options per mode, gives immediate feedback + explanation,
  then a results screen.
- Per-mode rendering rules live in `quizConfig.ts` (pure): option kind
  (country-name / country-flag / text / colours), whether the prompt shows a flag,
  and whether the question is map-based. Map questions render the interactive map
  **and** an equivalent set of buttons — the accessible / offline non-map path
  (PRD §7.4, §19).
- The question bank moved to its own module (`src/data/questions.ts`) and the
  games route is `React.lazy`-loaded, so the ~180KB of question JSON is code-split
  into the games chunk and kept out of the initial bundle (PRD §23).

## Progress & persistence (Phase 5)

- `ProgressProvider` (`src/app/providers/ProgressProvider.tsx`) loads all progress
  + stats from IndexedDB on mount and exposes `recordAnswer`, `recordGameCompleted`,
  derived selectors (`discoveredCountryIds`, `topicMastery`, `masteryFor`) and
  `reset`. It wraps the authenticated app under `RequireProfile`.
- Every answered question updates **topic mastery** and **per-country mastery**
  (`applyAnswer`, 0–100 clamp); a country becomes **discovered** on its first
  correct answer (`discoveredAt`). Persisted immediately (FR-011/FR-012/FR-016).
- Adaptive selection is now cross-session: `QuizScreen` feeds stored progress into
  `selectQuestions`, so difficulty tracks real mastery (FR-014/AC-10).
- **Passport** shows discovered count, per-continent completion bars, and flag
  "stamps"; **Achievements** evaluates badge criteria via the pure
  `earnedAchievementIds` (FR-013); **Progress** shows topic mastery, practise
  suggestions and recent activity. The Explore map highlights discovered/mastered
  countries. The Game Hub shows a "done today" state for the daily challenge.
- A v2 Dexie `stats` store holds `gamesCompleted`, `lastDailyDate` and a capped
  `recentActivity` list. Settings → reset clears everything and restarts onboarding.
- Verified by an e2e that plays a game and re-reads progress after a full reload.

## Game engine (Phase 3)

All pure, deterministic and unit-tested in `src/lib/game-engine`; the game UIs in
Phase 4 consume it.

- **Selection** (`selection.ts`) — adaptive question picking (FR-014, AC-10):
  filters by age band, targets the difficulty band matching per-topic mastery,
  prioritises weaker topics, and avoids recently-seen questions. Seeded so ties
  break deterministically but vary across sessions.
- **Session** (`session.ts`) — immutable quiz state machine: current question →
  `answerCurrent` (records + returns feedback, no auto-advance so the explanation
  can show) → `advance` → summary/score.
- **Daily challenge** (`dailyChallenge.ts`) — deterministic per local date, drawn
  from the local bank with variety across game modes (FR-015).
- **Scoring/mastery** (`scoring.ts`, `mastery.ts`) — from Phase 0: answer
  validation and the 0–100 mastery update (PRD §10).

## Map (Phase 2)

- **Geometry** — `scripts/build-content.ts` converts Natural Earth (via
  `world-atlas`, 110m) TopoJSON to GeoJSON, keeps every included country with
  geometry, and keys each feature by `geometryId` (= country id). Output: `src/data/geometry/countries.geo.json`.
- **Abstraction** (`src/features/map/mapModel.ts`) — pure, provider-agnostic:
  feature→country id, visual-state/style resolver, fit-to-country bounds. Unit-tested.
  Game/UI code only ever sees country ids, never Leaflet objects (PRD §16).
- **Rendering** (`WorldMap.tsx`, lazy-loaded via `LazyWorldMap`) — Leaflet with a
  GeoJSON layer, **no tile layer by default** so it works offline; an OSM tile layer
  is pluggable per-map (`showTiles`) with attribution. Touch pan/pinch-zoom,
  responsive via `ResizeObserver`, graceful error fallback ("play other games").
- **Screens** — Explore renders the map with a searchable list as the accessible /
  offline fallback (PRD §7.4, §19); Country Detail shows a fit-to-country mini-map.
- **Full world map** — `countries.geo.json` contains every independent country with
  110m geometry (165), all interactive. (An earlier faint gray base layer was
  removed once every country became explorable.)
- **Antimeridian** — Russia and Fiji cross ±180°; the build unwraps polygon rings
  so they render contiguously instead of as bands across the map.
- Leaflet + geometry are code-split, so the initial bundle is unchanged.

### E2E note

The environment ships a preinstalled Chromium whose build differs from Playwright's
expected one. `playwright.config.ts` detects the binary under
`PLAYWRIGHT_BROWSERS_PATH` and uses it via `executablePath` (no browser download).

## Content pipeline (Phase 1)

Geography content is **generated and validated at build time**, then committed:

- **Authored source** — `src/data/countries/source.ts` is an enrichment overlay
  (child-friendly facts, difficulty hints, continent overrides) for the originally-
  curated countries, plus `src/data/flags/templates.ts` (simplified flags for Flag
  Builder). Country *inclusion* is now driven by `world-countries` (all independent
  states), not this file.
- **Generator** — `scripts/build-content.ts` (`npm run build:content`) pulls
  metadata from `world-countries`, copies flag SVGs from `flag-icons` into
  `public/assets/flags/`, runs the pure generators in `src/data/generate.ts`, and
  writes `src/data/countries/countries.generated.json` +
  `src/data/questions/questions.generated.json`.
- **Full dataset:** the build includes **all ~194 independent countries** from
  `world-countries` (capital + flag + mappable continent). `source.ts` is now an
  *enrichment overlay* (authored facts, difficulty hints, continent overrides) for
  the originally-curated set; everything else is derived — difficulty from land
  area, facts default to none (optional; Country Detail hides the section).
- **Questions are templated, not AI-generated** (PRD §4) — deterministic templates
  over reviewed country data, so the bank is reproducible and reviewable. Current
  bank: 194 countries, 1370 questions (flag 388, capital 388, continent 194, map
  194, detective 194, flag-builder 12). 29 micro-states have no 110m map geometry,
  so they're in the dataset but not drawn on the map (165 map geometries).
- **Validation** — `npm run validate:content` runs structural/referential checks
  (`validateContent`) **and** MVP completeness gates (`validateCompleteness`:
  ≥50 countries, all inhabited continents, ≥10 questions/mode, flag+capital+geometry
  present). Both gate CI.
- Geography/continent conventions and source attributions: see
  `docs/geography-conventions.md` and `NOTICE.md`. When changing content, edit the
  source files, run `build:content`, and commit the regenerated JSON + flags.

## Visual design & accessibility

- Playful, high-energy look for children: a gradient header, a vibrant "jewel-tone"
  palette where each game and home tile has its own colour, rounded cards, soft
  shadows and gentle hover lifts (all animation respects `prefers-reduced-motion`).
- **Colour is never the only signal** (PRD §21, colour-blind safety):
  - Quiz answers show a **✓ / ✗ badge** and a "Correct! / Good try!" headline with
    an emoji, in addition to green/red — so right vs wrong is clear without colour.
  - Nav/active and selected states use weight + a filled pill, not just colour.
  - Card colours are decorative; every card also carries a distinct emoji + label.
- Text is AA-contrast: dark ink on light surfaces, white on the jewel-tone cards.
  Focus-visible rings are kept for keyboard users.
- All styling lives in `src/styles/global.css` (design tokens in `:root`); card
  colours are assigned by `:nth-child` so no component changes are needed.

## Decisions

- **Stack** follows PRD §17: React + TypeScript + Vite, `vite-plugin-pwa`, Dexie
  (IndexedDB), Vitest + RTL + Playwright, ESLint + Prettier, TS strict mode.
- **Package manager: npm.**
- **TypeScript strict**, plus `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes` for extra safety on content records.
- **Data sourcing (chosen, to be applied in Phase 1):** build the 50-country slice
  from established open datasets rather than hand-typing everything —
  [`world-countries`](https://www.npmjs.com/package/world-countries) for metadata,
  an open SVG flag set for `flagAsset`, and Natural Earth country polygons (GeoJSON)
  for map geometry. Questions and child-friendly facts are **hand-authored and
  reviewed** — the PRD forbids unreviewed AI-generated child-facing content (§4).
- **Country `id`** = lowercased ISO 3166-1 alpha-2 (`fr`, `br`, `jp`). Stable
  identifier per PRD §15. `geometryId` currently mirrors `id`; it stays a separate
  field so map geometry can diverge from text content (PRD §16).
- **Content validation** (`src/data/validate.ts`, run via `npm run validate:content`)
  fails the build on structural/reference errors; coverage gaps (e.g. a game mode
  with no questions yet) are warnings in Phase 0 and tightened later.
- **Map abstraction (Phase 2):** map interactions will return a country `id`, never
  Leaflet-specific objects, so game logic stays provider-agnostic (PRD §16).

## Assumptions

- One local profile per device (`profile` store keyed by a fixed id). No multi-user
  profiles in MVP.
- `Progress.key` is either a country id or `topic:<topic>` — a single store covers
  both country and topic mastery.
- Antarctica is included in the `Continent` union for completeness but excluded from
  passport continent progress (no countries).
- Seed countries have empty `neighbours` because none of the three border each other;
  the neighbour graph is populated with the full slice in Phase 1.

## Open questions / to document

- ~~**Disputed & transcontinental geography**~~ — resolved in
  `docs/geography-conventions.md` (Russia→Europe, Türkiye/Kazakhstan→Asia, Egypt→Africa).
- ~~**Flag asset licensing**~~ — flag-icons is MIT, world-countries is ODbL;
  attribution recorded in `NOTICE.md`.
- **Map tile provider & attribution (Phase 2):** select an OSM-compatible tile
  provider and wire required attribution before Phase 2 ships (PRD §16, §35). Each
  country already has a stable `geometryId` (currently = its id) ready to bind to
  real geometry.
- **Flag Builder templates (PRD §7.6):** decide the controlled template format for
  simplified flags.
- **Icons:** `public/icons/*` are solid-colour placeholders. Replace with designed
  maskable icons before release.

## Commands

```bash
npm install
npm run dev              # start dev server
npm run typecheck        # tsc project references, no emit
npm run lint             # eslint
npm run test             # vitest (unit + component)
npm run test:e2e         # playwright (requires browsers installed)
npm run build:content    # regenerate country + question data from sources
npm run validate:content # content integrity + MVP completeness checks
npm run build            # typecheck + production build
```
