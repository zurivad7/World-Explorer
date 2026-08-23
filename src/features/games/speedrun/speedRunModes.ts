import type { Country, Topic } from '@/types';
import { countries } from '@/data';

/** The three Speed Run challenges (8+). Each is a 30-second blitz. */
export type SpeedRunKind = 'flag' | 'find-it' | 'capital';

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
  return active; // flag
}
