/**
 * Core domain types for World Explorer.
 *
 * These mirror the data model in docs/PRD.md §14. Geography *content* (countries,
 * questions, achievements) is kept separate from UI code — see src/data. Player
 * *state* (progress, profile) lives in IndexedDB — see src/lib/storage.
 */

export type Continent =
  | 'Africa'
  | 'Antarctica'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'Oceania'
  | 'South America';

export const CONTINENTS: readonly Continent[] = [
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
] as const;

export type AgeBand = '5-7' | '8-10' | '11-13';

export const AGE_BANDS: readonly AgeBand[] = ['5-7', '8-10', '11-13'] as const;

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const;

/**
 * Game modes. The first six are the MVP standalone games with Game Hub cards
 * (PRD §7). `good-to-know` is a bonus category of fact questions (language,
 * currency, dialing code, internet domain) that has no hub card of its own — it
 * adds variety to the per-country quiz and the daily challenge.
 */
export type GameMode =
  | 'flag-detective'
  | 'capital-challenge'
  | 'continent-challenge'
  | 'map-find-it'
  | 'geography-detective'
  | 'flag-builder'
  | 'good-to-know'
  | 'shape-detective'
  | 'odd-one-out'
  | 'find-the-lie'
  | 'closest-country'
  | 'in-common';

export const GAME_MODES: readonly GameMode[] = [
  'flag-detective',
  'capital-challenge',
  'continent-challenge',
  'map-find-it',
  'geography-detective',
  'flag-builder',
  'good-to-know',
  'shape-detective',
  'odd-one-out',
  'find-the-lie',
  'closest-country',
  'in-common',
] as const;

/** A learning topic used for mastery tracking and question selection (PRD §10). */
export type Topic =
  | 'flags'
  | 'capitals'
  | 'continents'
  | 'location'
  | 'clues'
  | 'facts'
  | 'shapes'
  | 'reasoning';

/**
 * Metadata about the provenance of a factual record. Every factual content
 * record must carry source and review metadata (PRD §15).
 */
export interface SourceMeta {
  source: string;
  reviewedAt?: string; // ISO date
}

export interface CountryFact {
  text: string;
  source?: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

/** A country record (PRD §14). `geometryId` links to map geometry, kept separate from text. */
export interface Country {
  id: string; // stable internal id (we use iso2 lowercased)
  iso2: string;
  iso3: string;
  name: string;
  capital: string;
  /** Authored note for capital nuance (multiple capitals, official vs best-known). */
  capitalNote?: string;
  continent: Continent;
  region: string;
  flagAsset: string;
  geometryId: string;
  neighbours: string[]; // country ids
  facts: CountryFact[];
  // Verifiable "good to know" facts, sourced from world-countries (PRD §15).
  area: number; // land area in km²
  landlocked: boolean;
  languages: string[]; // language names
  currency?: Currency;
  callingCode?: string; // e.g. "+33"
  tld?: string; // internet top-level domain, e.g. ".fr"
  demonym?: string; // what the people are called, e.g. "French"
  /** A major/notable river — authored & reviewed, present only where written. */
  notableRiver?: string;
  /** Representative [lat, lng] point, used to pin countries too small to draw on the map. */
  latlng?: [number, number];
  active: boolean;
  source: string;
  reviewedAt?: string; // ISO date
}

export interface Flag {
  countryId: string;
  asset: string;
  colours: string[];
  symbols: string[];
  simplifiedTemplateId?: string;
}

/** A quiz question. `options`/`correctAnswer` are answer *ids* resolved by the game engine. */
export interface Question {
  id: string;
  type: GameMode;
  difficulty: Difficulty;
  ageBands: AgeBand[];
  topic: Topic;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  countryId?: string;
  /** Multiple subject countries to display (e.g. the flags in a "what's in common" question). */
  subjectIds?: string[];
  active: boolean;
  source: string;
  reviewedAt?: string;
}

export type AchievementCriteriaKind =
  | 'countries-discovered'
  | 'topic-mastered'
  | 'continent-completed'
  | 'games-completed';

export interface AchievementCriteria {
  kind: AchievementCriteriaKind;
  threshold: number;
  topic?: Topic;
  continent?: Continent;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
  active: boolean;
}

/** Per-country / per-topic learning progress (PRD §14). Persisted locally. */
export interface Progress {
  /** Either a country id or a `topic:<topic>` key. */
  key: string;
  attempts: number;
  correct: number;
  masteryScore: number; // 0-100
  discoveredAt?: string; // ISO date
  lastPlayedAt?: string; // ISO date
}

/** The local player profile (PRD §14). No account, no PII beyond an optional nickname. */
export interface Profile {
  ageBand: AgeBand;
  nickname?: string;
  soundEnabled: boolean;
  reducedMotion: boolean;
  createdAt: string; // ISO date
  schemaVersion: number;
}
