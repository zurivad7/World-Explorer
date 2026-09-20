import type { Country, Topic } from '@/types';
import { countries } from '@/data';
import { seededShuffle } from '@/lib/game-engine';

/** The Speed Run challenges (8+). Each is a timed blitz. */
export type SpeedRunKind = 'flag' | 'find-it' | 'capital' | 'neighbours';

/** How the player answers a Speed Run item. */
export type SpeedRunInput = 'choices' | 'map' | 'text';

export interface SpeedRunModeMeta {
  kind: SpeedRunKind;
  title: string;
  icon: string;
  blurb: string;
  input: SpeedRunInput;
  /** Learning topic this challenge trains (for mastery updates). */
  topic: Topic;
  /** Optional per-mode length override (defaults to SPEED_RUN_SECONDS). */
  seconds?: number;
}

export const SPEED_RUN_MODES: SpeedRunModeMeta[] = [
  {
    kind: 'flag',
    title: 'Flag Blitz',
    icon: '🚩',
    blurb: 'See a flag, tap the country — as many as you can in 30 seconds.',
    input: 'choices',
    topic: 'flags',
  },
  {
    kind: 'find-it',
    title: 'Find It Blitz',
    icon: '📍',
    blurb: 'Find each country on the map before the clock runs out.',
    input: 'map',
    topic: 'location',
  },
  {
    kind: 'capital',
    title: 'Capital Blitz',
    icon: '⌨️',
    blurb: 'Type each capital city — no choices, spelling counts (a little).',
    input: 'text',
    topic: 'capitals',
  },
  {
    kind: 'neighbours',
    title: 'Neighbours Blitz',
    icon: '🏘️',
    blurb: "Two neighbours' flags — type the country between them. One minute, no choices.",
    input: 'text',
    topic: 'location',
    seconds: 60,
  },
];

export function getSpeedRunMode(kind: string): SpeedRunModeMeta | undefined {
  return SPEED_RUN_MODES.find((m) => m.kind === kind);
}

/** How long a Speed Run lasts, in seconds. */
export const SPEED_RUN_SECONDS = 30;

/** Countries big enough to be findable on a world map (Find It targets). */
const FINDABLE_MIN_AREA_KM2 = 50_000;

/**
 * The pool of countries a given challenge can draw from. Flags/capitals can use
 * everyone; Find It is limited to countries large enough to tap on a world map.
 */
export function speedRunPool(kind: SpeedRunKind, source: readonly Country[] = countries): Country[] {
  const active = source.filter((c) => c.active);
  if (kind === 'find-it') return active.filter((c) => c.area >= FINDABLE_MIN_AREA_KM2);
  if (kind === 'capital') return active.filter((c) => c.capital.length > 0);
  // Neighbours Blitz needs at least two land neighbours to show two flags.
  if (kind === 'neighbours') {
    const ids = new Set(active.map((c) => c.id));
    return active.filter((c) => c.neighbours.filter((n) => ids.has(n)).length >= 2);
  }
  return active; // flag
}

/** Two of a country's neighbours to show as flags, chosen deterministically. */
export function neighbourPair(
  target: Country,
  seed: string,
  source: readonly Country[] = countries
): Country[] {
  const byId = new Map(source.map((c) => [c.id, c]));
  return seededShuffle(
    target.neighbours.filter((n) => byId.has(n)),
    `nbr-pair-${target.id}-${seed}`
  )
    .slice(0, 2)
    .map((id) => byId.get(id)!);
}
