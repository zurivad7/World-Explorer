# Development Notes

Working notes for the World Explorer build: decisions made, assumptions taken, and
open questions to resolve. The product source of truth is [`docs/PRD.md`](docs/PRD.md).

## Phase status

| Phase | Status |
| --- | --- |
| 0 Foundation | ✅ Complete |
| 1 Content (50-country slice) | ⏳ Next |
| 2 Map | ⬜ Not started |
| 3 Game engine | 🟡 Skeleton in place (`src/lib/game-engine`) |
| 4 Games | ⬜ Not started |
| 5 Progress | 🟡 Storage layer in place (`src/lib/storage`) |
| 6 Offline/PWA | 🟡 Manifest + service worker configured |
| 7 QA | ⬜ Not started |

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

- **Disputed & transcontinental geography (PRD §7.3, §15):** need a documented,
  reviewed convention for cases like Russia/Turkey (Europe vs Asia), Egypt, and
  disputed territories **before** authoring the 50-country slice. Tracked for Phase 1.
- **Flag asset licensing:** confirm the chosen flag set's licence and add attribution
  where required (PRD §15).
- **Map tile provider & attribution:** select an OSM-compatible tile provider and
  wire required attribution before Phase 2 ships (PRD §16, §35).
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
npm run validate:content # content integrity checks
npm run build            # typecheck + production build
```
