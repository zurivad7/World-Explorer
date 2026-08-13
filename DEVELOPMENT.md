# Development Notes

Working notes for the World Explorer build: decisions made, assumptions taken, and
open questions to resolve. The product source of truth is [`docs/PRD.md`](docs/PRD.md).

## Phase status

| Phase | Status |
| --- | --- |
| 0 Foundation | ✅ Complete |
| 1 Content (50-country slice) | ✅ Complete |
| 2 Map | ✅ Complete |
| 3 Game engine | 🟡 Skeleton in place (`src/lib/game-engine`) |
| 4 Games | ⏳ Next |
| 5 Progress | 🟡 Storage layer in place (`src/lib/storage`) |
| 6 Offline/PWA | 🟡 Manifest + service worker; flags + map geometry precached |
| 7 QA | ⬜ Not started |

## Map (Phase 2)

- **Geometry** — `scripts/build-content.ts` converts Natural Earth (via
  `world-atlas`, 110m) TopoJSON to GeoJSON, keeps the 50-country slice, and keys
  each feature by `geometryId` (= country id). Output: `src/data/geometry/countries.geo.json`.
- **Abstraction** (`src/features/map/mapModel.ts`) — pure, provider-agnostic:
  feature→country id, visual-state/style resolver, fit-to-country bounds. Unit-tested.
  Game/UI code only ever sees country ids, never Leaflet objects (PRD §16).
- **Rendering** (`WorldMap.tsx`, lazy-loaded via `LazyWorldMap`) — Leaflet with a
  GeoJSON layer, **no tile layer by default** so it works offline; an OSM tile layer
  is pluggable per-map (`showTiles`) with attribution. Touch pan/pinch-zoom,
  responsive via `ResizeObserver`, graceful error fallback ("play other games").
- **Screens** — Explore renders the map with a searchable list as the accessible /
  offline fallback (PRD §7.4, §19); Country Detail shows a fit-to-country mini-map.
- Leaflet + geometry are code-split, so the initial bundle is unchanged.

### E2E note

The environment ships a preinstalled Chromium whose build differs from Playwright's
expected one. `playwright.config.ts` detects the binary under
`PLAYWRIGHT_BROWSERS_PATH` and uses it via `executablePath` (no browser download).

## Content pipeline (Phase 1)

Geography content is **generated and validated at build time**, then committed:

- **Authored source** — `src/data/countries/source.ts` (the 50-country slice: which
  countries, child-friendly facts, difficulty hints, continent overrides) and
  `src/data/flags/templates.ts` (simplified flags for Flag Builder).
- **Generator** — `scripts/build-content.ts` (`npm run build:content`) pulls
  metadata from `world-countries`, copies flag SVGs from `flag-icons` into
  `public/assets/flags/`, runs the pure generators in `src/data/generate.ts`, and
  writes `src/data/countries/countries.generated.json` +
  `src/data/questions/questions.generated.json`.
- **Questions are templated, not AI-generated** (PRD §4) — deterministic templates
  over reviewed country data, so the bank is reproducible and reviewable. Current
  bank: 50 countries, 362 questions (flag 100, capital 100, continent 50, map 50,
  detective 50, flag-builder 12).
- **Validation** — `npm run validate:content` runs structural/referential checks
  (`validateContent`) **and** MVP completeness gates (`validateCompleteness`:
  ≥50 countries, all inhabited continents, ≥10 questions/mode, flag+capital+geometry
  present). Both gate CI.
- Geography/continent conventions and source attributions: see
  `docs/geography-conventions.md` and `NOTICE.md`. When changing content, edit the
  source files, run `build:content`, and commit the regenerated JSON + flags.

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
