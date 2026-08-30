import type { GameMode } from '@/types';

/**
 * The five learning pillars (PRD §7). Every standalone game belongs to exactly one,
 * so the Game Hub can group the (now many) cards into scannable sections instead of
 * one long undifferentiated grid.
 */
export type Pillar = 'KNOW' | 'LOCATE' | 'DISCOVER' | 'THINK' | 'COMPETE';

export interface PillarMeta {
  pillar: Pillar;
  title: string;
  blurb: string;
  icon: string;
}

/** Display order and copy for the pillar sections. */
export const PILLAR_META: readonly PillarMeta[] = [
  { pillar: 'KNOW', title: 'Know', blurb: 'Flags, capitals and facts', icon: '🧠' },
  { pillar: 'LOCATE', title: 'Locate', blurb: 'Where in the world', icon: '🧭' },
  { pillar: 'DISCOVER', title: 'Discover', blurb: 'Recognise countries', icon: '🔎' },
  { pillar: 'THINK', title: 'Think', blurb: 'Reasoning puzzles', icon: '💡' },
  { pillar: 'COMPETE', title: 'Compete', blurb: 'Score and win', icon: '🏆' },
] as const;

export interface GameModeMeta {
  mode: GameMode;
  title: string;
  icon: string;
  blurb: string;
  /** The learning pillar this game belongs to (for Game Hub grouping). */
  pillar: Pillar;
  /** Map-based modes require an accessible non-map alternative (PRD §7.4, §21). */
  mapBased: boolean;
}

/** Standalone game modes as presentation metadata for the Game Hub (PRD §7). */
export const GAME_MODE_META: GameModeMeta[] = [
  {
    mode: 'flag-detective',
    title: 'Flag Detective',
    icon: '🚩',
    blurb: 'Match flags to countries.',
    pillar: 'KNOW',
    mapBased: false,
  },
  {
    mode: 'capital-challenge',
    title: 'Capital Challenge',
    icon: '🏙️',
    blurb: 'Find the right capital city.',
    pillar: 'KNOW',
    mapBased: false,
  },
  {
    mode: 'continent-challenge',
    title: 'Continent Challenge',
    icon: '🌍',
    blurb: 'Which continent is it in?',
    pillar: 'KNOW',
    mapBased: false,
  },
  {
    mode: 'flag-builder',
    title: 'Flag Builder',
    icon: '🎨',
    blurb: 'Build a flag from its pieces.',
    pillar: 'KNOW',
    mapBased: false,
  },
  {
    mode: 'map-find-it',
    title: 'Find It',
    icon: '📍',
    blurb: 'Find countries on the map.',
    pillar: 'LOCATE',
    mapBased: true,
  },
  {
    mode: 'closest-country',
    title: 'Closest Country',
    icon: '📏',
    blurb: 'Which country is nearest to another?',
    pillar: 'LOCATE',
    mapBased: false,
  },
  {
    mode: 'border-battle',
    title: 'Border Battle',
    icon: '🧭',
    blurb: 'Pick every neighbour that shares a border.',
    pillar: 'LOCATE',
    mapBased: false,
  },
  {
    mode: 'shape-detective',
    title: 'Shape Detective',
    icon: '🧩',
    blurb: 'Name the country from its outline.',
    pillar: 'DISCOVER',
    mapBased: false,
  },
  {
    mode: 'geography-detective',
    title: 'Geography Detective',
    icon: '🕵️',
    blurb: 'Solve clues to name the country.',
    pillar: 'THINK',
    mapBased: false,
  },
  {
    mode: 'odd-one-out',
    title: 'Odd One Out',
    icon: '🚫',
    blurb: 'Spot the country that does not belong.',
    pillar: 'THINK',
    mapBased: false,
  },
  {
    mode: 'find-the-lie',
    title: 'Find the Lie',
    icon: '🕵️‍♀️',
    blurb: 'Two facts are true, one is false.',
    pillar: 'THINK',
    mapBased: false,
  },
  {
    mode: 'in-common',
    title: 'In Common',
    icon: '🔗',
    blurb: 'What do these countries share?',
    pillar: 'THINK',
    mapBased: false,
  },
  {
    mode: 'bet-your-knowledge',
    title: 'Bet Your Knowledge',
    icon: '🎲',
    blurb: 'Bet points on how sure you are.',
    pillar: 'COMPETE',
    mapBased: false,
  },
];

export function getGameModeMeta(mode: string): GameModeMeta | undefined {
  return GAME_MODE_META.find((m) => m.mode === mode);
}

/** The game cards for one pillar, in their declared order. */
export function gameModesForPillar(pillar: Pillar): GameModeMeta[] {
  return GAME_MODE_META.filter((m) => m.pillar === pillar);
}
