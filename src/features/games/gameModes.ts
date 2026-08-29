import type { GameMode } from '@/types';

export interface GameModeMeta {
  mode: GameMode;
  title: string;
  icon: string;
  blurb: string;
  /** Map-based modes require an accessible non-map alternative (PRD §7.4, §21). */
  mapBased: boolean;
}

/** The six MVP game modes (PRD §7) as presentation metadata for the Game Hub. */
export const GAME_MODE_META: GameModeMeta[] = [
  {
    mode: 'flag-detective',
    title: 'Flag Detective',
    icon: '🚩',
    blurb: 'Match flags to countries.',
    mapBased: false,
  },
  {
    mode: 'capital-challenge',
    title: 'Capital Challenge',
    icon: '🏙️',
    blurb: 'Find the right capital city.',
    mapBased: false,
  },
  {
    mode: 'continent-challenge',
    title: 'Continent Challenge',
    icon: '🌍',
    blurb: 'Which continent is it in?',
    mapBased: false,
  },
  {
    mode: 'map-find-it',
    title: 'Find It',
    icon: '📍',
    blurb: 'Find countries on the map.',
    mapBased: true,
  },
  {
    mode: 'geography-detective',
    title: 'Geography Detective',
    icon: '🕵️',
    blurb: 'Solve clues to name the country.',
    mapBased: false,
  },
  {
    mode: 'flag-builder',
    title: 'Flag Builder',
    icon: '🎨',
    blurb: 'Build a flag from its pieces.',
    mapBased: false,
  },
  {
    mode: 'shape-detective',
    title: 'Shape Detective',
    icon: '🧩',
    blurb: 'Name the country from its outline.',
    mapBased: false,
  },
  {
    mode: 'odd-one-out',
    title: 'Odd One Out',
    icon: '🚫',
    blurb: 'Spot the country that does not belong.',
    mapBased: false,
  },
  {
    mode: 'find-the-lie',
    title: 'Find the Lie',
    icon: '🕵️‍♀️',
    blurb: 'Two facts are true, one is false.',
    mapBased: false,
  },
];

export function getGameModeMeta(mode: string): GameModeMeta | undefined {
  return GAME_MODE_META.find((m) => m.mode === mode);
}
