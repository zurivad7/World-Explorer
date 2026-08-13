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
| `npm run validate:content` | Validate geography content integrity |

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

## Status

Phase 0 (foundation) is complete. See [`DEVELOPMENT.md`](DEVELOPMENT.md) for the
phase plan and what's next (the 50-country content slice).
