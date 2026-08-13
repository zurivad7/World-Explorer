# World Explorer

**Product Requirements Document • MVP • Claude Code Build Specification**

Version 1.0 • Responsive website + installable Progressive Web App • iPadOS + Android + desktop

> **Purpose:** This document is the source of truth for the build. It defines the product, MVP boundaries, architecture, data model, user stories, screen requirements, acceptance criteria and implementation workflow.

---

## 1. Product Summary

World Explorer is a child-friendly geography game delivered as a responsive website that can be installed as a PWA on iPadOS and Android. It combines short games with an interactive world map and a collectible digital passport.

The experience should feel like exploration rather than schoolwork: children discover countries, identify flags, learn capitals and continents, locate countries on a map and solve geography mysteries.

## 2. Vision & Value Proposition

- **Vision:** Help children become curious about the world by turning geography into exploration, discovery and play.
- **Product promise:** "Explore the world. Discover countries. Earn your passport."

## 3. Goals

- Make geography understandable and fun for children aged approximately 5–13.
- Support both structured quiz play and free-form map exploration.
- Use short sessions and immediate feedback to reinforce learning.
- Create visible progress through a digital passport and achievements.
- Work without an account and remain useful offline for core games.
- Provide a safe, privacy-conscious product with no advertising or public social features in MVP.

## 4. Non-Goals / MVP Boundaries

- No multiplayer, public chat, social feed or public leaderboard.
- No advertising, in-app purchases, virtual currency or loot-box mechanics.
- No mandatory account creation.
- No precise location collection, camera, microphone or contacts.
- No full physical-geography curriculum in MVP.
- No live geopolitical/news data.
- No AI-generated child-facing questions without human/content validation.
- No cloud sync in MVP.

## 5. Target Users

| User | Needs | Design response |
| --- | --- | --- |
| Explorer 1 • 5–7 | Visual learning, simple language, touch interaction | Large controls, simple questions, flags/continents, minimal reading |
| Explorer 2 • 8–10 | Countries, capitals, borders and map skills | More recall, map challenges and clues |
| Explorer 3 • 11–13 | Harder geography and reasoning | Similar flags, relative location, harder clues and comparisons |
| Parent/guardian | Safety and evidence of learning | No ads/social features; simple local progress view |

## 6. Core Experience

1. Open the website or installed PWA.
2. Choose an age band; nickname is optional.
3. See Home with Explore, Play, Passport and Daily Challenge.
4. Explore the map or select a game.
5. Complete a short challenge.
6. Receive immediate feedback and a brief explanation.
7. Earn discovery progress, passport stamps and badges.
8. Return to the map/passport and see what has been learned.
9. Recommended practice focuses on topics/countries that need reinforcement.

## 7. Primary Game Modes

### 7.1 Flag Detective
- Flag → choose the country from 3–4 options.
- Country → choose the correct flag.
- Difficulty increases by introducing visually similar flags.
- After answering, show flag, country, capital and continent.

### 7.2 Capital Challenge
- Country → capital.
- Capital → country.
- Multiple choice first; harder levels use recall.
- After answering, reveal the country on the map.

### 7.3 Continent Challenge
- Country → continent.
- Continent → country.
- Use map context whenever practical.
- Content rules must explicitly handle countries with disputed or multiple geographic conventions.

### 7.4 Map Challenge — Find It
- Prompt: "Find Brazil." Child taps the country polygon.
- Support pan, pinch zoom and fit-to-country.
- Progress from large/easy countries to smaller/harder countries.
- Later questions can ask for neighbours or relative location.
- Every map-only task needs a non-map alternative for accessibility/offline use.

### 7.5 Geography Detective
- Present 2–4 clues: continent, capital, flag characteristics, neighbours, region or other approved facts.
- Child identifies the country.
- Reduce clue count and increase specificity at higher difficulty.
- Reveal the country on the map after the answer.

### 7.6 Flag Builder
- Build a simplified supported flag by placing colours/elements in the correct positions.
- MVP uses controlled templates rather than a general-purpose vector editor.
- Completion reveals country and a child-friendly flag fact.

## 8. Explore Mode

- Interactive world map.
- Continent filters.
- Country search.
- Tap country to open Country Detail.
- Country Detail shows flag, capital, continent, region, neighbours and 2–3 child-friendly facts.
- Show discovered/mastered state.
- Launch a game directly from Country Detail.

## 9. Digital Passport & Rewards

- Each discovered country earns a passport stamp/card.
- Show first-discovered date and mastery status locally.
- Track completion by continent.
- Badges include Flag Finder, Map Master, Capital Collector, Continent Explorer and Globe Trotter.
- Missed days must not erase progress or punish the child.
- Rewards should encourage discovery, not compulsive engagement.

## 10. Adaptive Difficulty

Use a simple local mastery score rather than a complex machine-learning system. Each topic/country can maintain a score from 0–100.

- Correct answer: increase mastery.
- Incorrect answer: decrease mastery modestly.
- Repeated success promotes difficulty.
- Repeated failure selects easier/review content.
- Prioritise weak topics without endlessly repeating identical questions.
- Question metadata must include topic, difficulty, age band and country where applicable.

## 11. Functional Requirements

| ID | Requirement | Acceptance intent |
| --- | --- | --- |
| FR-001 | Start without account | Child can enter gameplay without registration. |
| FR-002 | Age band | User can select 5–7, 8–10 or 11–13. |
| FR-003 | Map | System displays interactive world map and country selection. |
| FR-004 | Country detail | System displays structured country information. |
| FR-005 | Flag game | System supports both flag→country and country→flag. |
| FR-006 | Capital game | System supports country→capital and capital→country. |
| FR-007 | Continent game | System tests country/continent association. |
| FR-008 | Map game | System validates country taps against map geometry. |
| FR-009 | Detective | System presents clue-based country challenges. |
| FR-010 | Flag builder | System validates simplified flag construction. |
| FR-011 | Scoring | System validates answers and updates progress. |
| FR-012 | Passport | System records discovered countries locally. |
| FR-013 | Achievements | System evaluates milestone criteria. |
| FR-014 | Adaptive difficulty | Question selection responds to recent performance. |
| FR-015 | Daily challenge | System presents a daily challenge from the local content bank. |
| FR-016 | Persistence | Progress survives refresh/restart on the same device. |
| FR-017 | PWA | Application is installable where browser/platform supports PWA installation. |
| FR-018 | Offline | Core non-map games work after required assets/content are cached. |
| FR-019 | Accessibility | Map games provide an accessible alternative. |
| FR-020 | Reset | User can delete local progress from Settings. |

## 12. User Stories

| ID | User story |
| --- | --- |
| US-01 | As a child, I want to start playing without creating an account so I can begin immediately. |
| US-02 | As a child, I want to choose an age-appropriate difficulty so the questions are understandable. |
| US-03 | As a child, I want to identify flags so I can learn what countries they represent. |
| US-04 | As a child, I want to learn capitals through games so I can remember them. |
| US-05 | As a child, I want to find countries on a map so I understand where they are. |
| US-06 | As a child, I want clues about a country so I can solve a geography mystery. |
| US-07 | As a child, I want to explore a country freely so geography is not only a quiz. |
| US-08 | As a child, I want a passport showing countries I have discovered so I can see my progress. |
| US-09 | As a child, I want badges for achievements so completing learning goals feels rewarding. |
| US-10 | As a child, I want mistakes explained so I learn instead of simply losing points. |
| US-11 | As a parent, I want no advertising or public chat so the product is safer for my child. |
| US-12 | As a parent, I want to see basic learning progress so I know what my child is practising. |
| US-13 | As a user, I want the app to work offline for core games so connectivity is not always required. |
| US-14 | As a user, I want to install the website on my tablet so it behaves like an app. |

## 13. Screen-by-Screen Requirements

| Screen | Requirements |
| --- | --- |
| S01 Home | Continue Learning, Explore World, Play, Passport, Daily Challenge. Show current discovery progress. No clutter. |
| S02 Onboarding | Age band selection, optional nickname, brief safety/privacy explanation, sound/motion preferences. |
| S03 World Map | Touch pan/zoom, country selection, continent filter, search, discovered state, map legend. |
| S04 Country Detail | Flag, name, capital, continent, region, neighbours, facts, discovery state, "Play this country". |
| S05 Game Hub | Six game cards, recommended activity, difficulty indication and daily challenge. |
| S06 Quiz | Question, 3–4 options or interaction, progress indicator, immediate feedback, explanation, next button. |
| S07 Map Challenge | Prompt, map, zoom controls, selected-country feedback, accessible alternate answer path. |
| S08 Passport | Continents, completion progress, country cards/stamps, mastery status. |
| S09 Achievements | Badge grid, earned/locked state and criteria. |
| S10 Progress | Topic strengths, countries/topics needing practice, recent activity. |
| S11 Settings | Sound, motion, age band, reset progress, privacy/about, installation help. |

## 14. Data Model

| Entity | Fields |
| --- | --- |
| Country | id, iso2, iso3, name, capital, continent, region, flagAsset, geometryId, neighbours[], facts[], active, source, reviewedAt |
| Flag | countryId, asset, colours[], symbols[], simplifiedTemplateId |
| Question | id, type, difficulty, ageBands[], topic, prompt, options[], correctAnswer, explanation, countryId?, active |
| Achievement | id, name, description, icon, criteria, active |
| Progress | countryId/topic, attempts, correct, masteryScore, discoveredAt?, lastPlayedAt |
| Profile | ageBand, nickname?, soundEnabled, reducedMotion, createdAt, schemaVersion |

## 15. Content & Data Governance

- Use ISO country codes as stable identifiers.
- Keep country metadata and questions in version-controlled structured files.
- Keep map geometry separate from text content.
- Every factual content record should carry source and review metadata.
- Do not hard-code country facts into UI components.
- Create a content validation script to detect missing capitals, flags, IDs, duplicate questions and invalid references.
- Geographic conventions must be documented, especially for transcontinental or disputed cases.
- Map data and tiles must comply with OpenStreetMap/provider attribution and usage policies.

## 16. Map Architecture

- Use Leaflet or another mature open-source map library.
- Use OpenStreetMap-compatible data/provider with an abstraction layer.
- Country geometries must have stable geometry IDs linked to Country records.
- Map interaction should return a country ID, not expose provider-specific details to game logic.
- Support touch gestures and responsive sizing.
- Do not make basic quiz play dependent on live map tiles.
- Provide graceful offline/error state.

## 17. Recommended Technical Stack

| Layer | Recommendation |
| --- | --- |
| Framework | React + TypeScript + Vite |
| PWA | vite-plugin-pwa or equivalent |
| Map | Leaflet + compliant OpenStreetMap-compatible provider |
| Persistence | IndexedDB, preferably through a small wrapper such as Dexie |
| Content | Version-controlled JSON/TypeScript data |
| State | React state/context; add a small state library only if justified |
| Testing | Vitest + React Testing Library + Playwright |
| Quality | TypeScript strict mode, ESLint, Prettier |
| Hosting | HTTPS static hosting/CDN with SPA routing |

## 18. Suggested Repository Structure

- `src/app` — shell, routes and providers
- `src/components` — shared UI
- `src/features/games` — reusable game engine + game modes
- `src/features/map` — map provider and interactions
- `src/features/country` — country detail
- `src/features/passport` — passport and achievements
- `src/features/progress` — mastery and progress
- `src/data/countries` — country metadata
- `src/data/questions` — question bank
- `src/data/achievements` — achievement definitions
- `src/lib/storage` — IndexedDB
- `src/lib/game-engine` — scoring/validation/difficulty
- `src/types` — shared types
- `public/assets` — flags/icons
- `tests` — unit/component/e2e

## 19. PWA Requirements

- HTTPS.
- Valid manifest with name, short name, icons, theme and display mode.
- Service worker caches application shell and required static assets.
- Installable on supported iPadOS and Android environments.
- Responsive safe-area handling on iOS.
- Installation help screen with platform-specific guidance.
- Feature-detect browser capabilities rather than assuming identical PWA support.

## 20. Offline Requirements

- Cache application shell.
- Cache country metadata, question bank and flag assets.
- Persist progress in IndexedDB.
- Allow non-map games offline after cache population.
- If map tiles are unavailable, show an offline map message and continue to provide non-map gameplay.
- No cloud sync in MVP.

## 21. Accessibility & Child-Friendly UX

- Minimum touch target approximately 44–48px for primary controls.
- Visible focus states on keyboard-capable devices.
- Semantic buttons and controls.
- Do not rely on colour alone.
- High contrast and readable typography.
- Reduced-motion setting.
- Short, age-appropriate instructions.
- Map challenges require non-map alternatives.
- Animations should be brief and non-essential.

## 22. Privacy & Safety

- No ads.
- No public profiles, messaging or chat.
- No precise location collection.
- No mandatory email/account.
- Nickname is optional and local.
- Do not collect unnecessary personal information.
- Before public launch, perform legal/privacy review for applicable children's privacy rules, including GDPR and other target-market requirements.

## 23. Non-Functional Requirements

- Responsive from small mobile screens through desktop.
- Fast initial rendering on typical mobile connections.
- Core gameplay must not depend on a backend.
- Business logic must be unit-testable.
- Production build must pass typecheck, lint and tests.
- No normal-operation console errors.
- Content must be maintainable without editing UI code.
- Graceful loading, error and offline states.

## 24. MVP Content Plan

- Start with a 50-country vertical slice covering all continents.
- At least 10 questions per game mode for initial validation.
- Include visually similar flags.
- Include countries of different sizes for map testing.
- Include easy, medium and hard content.
- Architecture must support expansion to the full country dataset without redesign.

## 25. Acceptance Criteria

| ID | Acceptance criterion |
| --- | --- |
| AC-01 | A new user can start without registration. |
| AC-02 | The application is installable as a PWA on supported Android and iPadOS environments. |
| AC-03 | World map supports touch pan, zoom and country selection. |
| AC-04 | Initial dataset contains at least 50 countries spanning all continents. |
| AC-05 | Each initial country has flag, capital, continent and map identity. |
| AC-06 | All six game modes can be completed. |
| AC-07 | Correct/incorrect feedback is immediate and understandable. |
| AC-08 | Progress survives refresh and browser restart on the same device. |
| AC-09 | Passport and achievements update correctly. |
| AC-10 | Adaptive difficulty changes selection based on recent performance. |
| AC-11 | Core non-map games work offline after cache population. |
| AC-12 | Map failure does not break other games. |
| AC-13 | No child-facing feature requires ads, public communication or unnecessary personal data. |
| AC-14 | Scoring, validation, mastery and progression have automated tests. |
| AC-15 | Typecheck, lint, automated tests and production build pass. |

## 26. Definition of Done

- Requirement implemented and linked to its FR/US.
- Responsive on mobile, tablet and desktop.
- Touch interaction tested.
- Accessible states implemented.
- Loading/error/offline states implemented.
- Automated tests cover critical logic.
- TypeScript passes.
- Lint passes.
- Tests pass.
- Production build passes.
- PWA manifest/service worker verified.
- Content validation passes.
- No unnecessary personal data is collected.

## 27. Claude Code Implementation Protocol

Work in milestones. Do not attempt to generate the entire application in a single pass.

1. Inspect the repository before changing files.
2. Read this PRD fully and map requirements to an implementation plan.
3. Identify framework/package manager/testing conventions already present.
4. Create a task checklist grouped by foundation, content, map, games, progression, PWA and quality.
5. Implement one milestone at a time.
6. After each milestone, run typecheck, lint, tests and build where applicable.
7. Do not proceed while a previous milestone has unresolved errors unless explicitly documented.
8. Prefer small, composable components and pure game logic.
9. Do not introduce a dependency unless the benefit is clear and the dependency is maintained.
10. Do not invent product requirements that conflict with this PRD.
11. Document assumptions and unresolved decisions in a DEVELOPMENT.md or equivalent file.

## 28. Claude Code Phase Plan

| Phase | Deliverables | Exit gate |
| --- | --- | --- |
| 0 Foundation | Repo inspection, architecture, Vite/React/TS baseline, PWA shell, tests | Build/lint/typecheck pass |
| 1 Content | 50-country dataset, question schema, validation tooling, flags | Content validation passes |
| 2 Map | Map provider abstraction, world map, country selection/detail | Touch/map tests pass |
| 3 Game Engine | Question engine, scoring, feedback, difficulty | Game logic tests pass |
| 4 Games | Six game modes | All game modes playable |
| 5 Progress | IndexedDB, mastery, passport, badges, daily challenge | Progress survives restart |
| 6 Offline/PWA | Caching, offline fallback, install/help flow | Offline acceptance criteria pass |
| 7 QA | Responsive/accessibility/e2e/security/privacy checks | Release checklist complete |

## 29. Testing Strategy

- Unit test answer validation, scoring, mastery calculation and achievement criteria.
- Component test quiz feedback, navigation and persistence boundaries.
- End-to-end test onboarding → game → result → passport.
- End-to-end test map selection → country detail → game.
- Test offline non-map gameplay.
- Test PWA manifest/service worker in supported browsers.
- Test small-screen touch layouts.
- Test reduced motion and keyboard navigation.
- Include content integrity tests for every release.

## 30. Product Analytics — Future Ready

Analytics are not required for MVP. If later introduced, prefer aggregate product events and avoid child profiling.

- Game started/completed.
- Question success/failure by topic, without unnecessary identity.
- Country discovery.
- Game-mode popularity.
- Session duration bucket.
- PWA installation event where technically supported.

## 31. Future Roadmap

- Expanded country coverage and question bank.
- Audio prompts for younger children.
- Richer physical geography: mountains, rivers, oceans and climate.
- Parent dashboard and optional account/cloud sync.
- Teacher/classroom mode.
- Curriculum-aligned learning paths.
- Human-reviewed AI-assisted content tooling.

## 32. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Map licensing/availability | Provider abstraction, correct attribution and non-map fallback. |
| Incorrect geography data | Source/review metadata and automated content validation. |
| Too much content too soon | 50-country vertical slice first. |
| Feels like homework | Exploration, visual feedback and short sessions. |
| PWA browser differences | Feature detection and platform-specific install guidance. |
| Privacy risk | Local-first design; no ads/social features. |
| Over-engineering | Client-side MVP and small dependency set. |

## 33. Product Success Criteria

- A first-time child can start a game without adult instruction.
- Most games take roughly 1–3 minutes.
- Feedback teaches something after both correct and incorrect answers.
- Map and passport make learning progress visible.
- Children can freely explore as well as follow structured challenges.
- Parents can understand basic progress without an account.
- The product remains useful without connectivity for core cached games.

## 34. First Claude Code Prompt

Read `docs/PRD.md` in full before making changes. Treat it as the product source of truth. Act as the lead engineer for World Explorer, a child-friendly geography PWA. Do not build the entire product in one pass.

First:
1. Inspect the repository, framework, package manager, build tooling and existing tests.
2. Create a technical implementation plan mapped to the PRD's FR, US and acceptance criteria.
3. Identify risks, ambiguities and decisions that need documenting.
4. Propose the smallest practical dependency set.
5. Implement only Phase 0:
   - application shell
   - responsive design foundation
   - routing
   - TypeScript domain types
   - PWA manifest/service worker foundation
   - test infrastructure
   - IndexedDB abstraction
   - initial content structure
6. Add a 50-country seed dataset only if the repository structure supports it cleanly; otherwise create the schema and a small validated fixture first.
7. Run typecheck, lint, tests and production build.
8. Fix all failures.
9. Summarise files changed, requirements addressed, tests run and the next milestone.

Rules:
- Do not invent requirements that conflict with the PRD.
- Keep geography content separate from UI code.
- Keep game logic pure and testable.
- Do not add authentication, analytics, ads, multiplayer or payments.
- Prefer maintainability over cleverness.
- Ask before making a product decision that materially changes scope.

## 35. Release Checklist

- [ ] 50-country content validated
- [ ] Flags render correctly
- [ ] Capital/continent data validated
- [ ] Map country selection tested
- [ ] Six game modes tested
- [ ] Passport progression tested
- [ ] Achievements tested
- [ ] Adaptive difficulty tested
- [ ] Offline quiz tested
- [ ] PWA installation tested on Android
- [ ] PWA installation tested on iPadOS
- [ ] Keyboard/accessibility checks completed
- [ ] Reduced-motion check completed
- [ ] Responsive checks completed
- [ ] Typecheck/lint/tests/build all pass
- [ ] Privacy/safety review completed
- [ ] OpenStreetMap/provider attribution verified
