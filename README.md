# World Explorer 🌍

A child-friendly geography game for ages ~5–13, delivered as a responsive website
and installable Progressive Web App (iPadOS, Android, desktop). Children discover
countries, identify flags, learn capitals and continents, find countries on a map,
solve geography mysteries, and collect a digital passport — no account required,
core games work offline.

> **Explore the world. Discover countries. Earn your passport.**

The full product spec is in [`docs/PRD.md`](docs/PRD.md). Build decisions and open
questions are tracked in [`DEVELOPMENT.md`](DEVELOPMENT.md).

## Tech stack

React + TypeScript + Vite · `vite-plugin-pwa` · Dexie (IndexedDB) ·
Vitest + React Testing Library + Playwright · ESLint + Prettier.

Local-first and privacy-conscious: no backend, no accounts, no ads, no tracking.

## Live preview

Pushes to `main` auto-deploy to GitHub Pages via
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):

**https://zurivad7.github.io/World-Explorer/**

One-time setup: in the repo, **Settings → Pages → Build and deployment → Source:
"GitHub Actions"**. After that, each push to `main` publishes automatically. The
app is served under the `/World-Explorer/` sub-path (configured via `PAGES_BASE`);
for a commercial root-domain host, `base` defaults to `/`.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. First run sends you through onboarding (pick an age band).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (project refs) and produce a production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run unit + component tests (Vitest) |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run build:content` | Regenerate the country + question data from sources |
| `npm run validate:content` | Validate content integrity + MVP completeness |

## Project structure

```
src/
  app/          shell, routes, providers, layout
  components/   shared UI
  features/     home, onboarding, map, country, games, passport, progress, settings
  data/         countries, questions, achievements (+ schema & validation)
  lib/
    storage/    IndexedDB (Dexie) persistence
    game-engine/ pure scoring, mastery & difficulty logic
  types/        shared domain types
  styles/       global styles
tests/          unit, component, e2e
scripts/        content validation CLI
public/         icons, favicon
docs/           PRD
```

## Content

Geography content is generated from open datasets (`world-countries`, `flag-icons`)
plus authored facts, then validated and committed — see
[`docs/geography-conventions.md`](docs/geography-conventions.md) and
[`NOTICE.md`](NOTICE.md). The current slice: **50 countries** across all inhabited
continents and **362 questions** spanning the six game modes. Regenerate with
`npm run build:content`.

## Status

Phases 0–4 are complete: foundation, the 50-country content slice, an
interactive offline-capable map, the adaptive game engine, and all **six playable
game modes** plus a daily challenge (with immediate feedback and explanations).
See [`DEVELOPMENT.md`](DEVELOPMENT.md) for the phase plan and what's next
(persisting progress, passport and badges in Phase 5).
