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

## Live site

**https://worldexplorer.cc**

Pushes to `main` auto-deploy to GitHub Pages via
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). One-time
setup: in the repo, **Settings → Pages → Build and deployment → Source: "GitHub
Actions"**. After that, each push to `main` publishes automatically.

The site is served at the apex custom domain, so the build uses `PAGES_BASE=/`
(root base). The old `zurivad7.github.io/World-Explorer/` URL now redirects to
`worldexplorer.cc` automatically — see [Custom domain](#custom-domain).

## Custom domain

The app is served at the apex domain **worldexplorer.cc**. Two things make that work,
and both are already in place:

- **[`public/CNAME`](public/CNAME)** contains `worldexplorer.cc`. Vite copies it into
  `dist/`, so every Actions deploy re-asserts the custom domain in the published
  artifact (an Actions deploy would otherwise drop the Pages custom-domain setting).
- The deploy workflow builds with **`PAGES_BASE=/`** so assets, the SPA fallback, and
  the PWA resolve from the domain root instead of `/World-Explorer/`.

DNS (at the registrar) points the apex at GitHub Pages, **DNS-only (no proxy)**:

| Type  | Host  | Value |
| ----- | ----- | ----- |
| A     | `@`   | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA  | `@`   | `2606:50c0:8000::153`, `…:8001::153`, `…:8002::153`, `…:8003::153` |
| CNAME | `www` | `zurivad7.github.io` |

Then **Settings → Pages → Custom domain** = `worldexplorer.cc` with **Enforce HTTPS**
on. GitHub issues the TLS certificate and redirects both `www` → apex and the old
`github.io` URL → `worldexplorer.cc`.

To move to a **different** domain: change `public/CNAME` and the registrar's DNS,
keep `PAGES_BASE=/`, and update the Pages custom-domain setting. To go back to the
**github.io sub-path**: delete `public/CNAME`, set `PAGES_BASE=/World-Explorer/`, and
clear the custom domain in Settings.

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
[`NOTICE.md`](NOTICE.md). The dataset covers **all ~194 independent countries**
(165 with map geometry) and **~1,370 questions** spanning the six game modes.
Child-friendly facts are authored per country and optional. Regenerate with
`npm run build:content`.

## Status

Phases 0–6 are complete: foundation, a content dataset covering **all ~194
independent countries**, an interactive offline-capable world map, the adaptive
game engine, all **six playable game modes** plus a daily challenge (with immediate
feedback and explanations), on-device progress, and **offline/PWA hardening** —
installable with platform-specific help, an offline banner, and full precaching so
core games and the map work with no connection. See [`DEVELOPMENT.md`](DEVELOPMENT.md)
for the phase plan and what's next (QA).

Progress persists on-device (IndexedDB): mastery, discovered countries, the
passport, badges and adaptive difficulty all carry across sessions.
