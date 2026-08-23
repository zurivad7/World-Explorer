import type { Country } from '@/types';
import { seededShuffle } from '@/lib/game-engine';

/** A shuffled, endless-friendly ordering of the pool for one Speed Run. */
export function shuffledDeck(pool: readonly Country[], seed: string): Country[] {
  return seededShuffle(pool, `speed-deck-${seed}`);
}

/**
 * Build the answer choices for a Flag Blitz item: the target plus `count - 1`
 * distinct distractors from the pool, all shuffled. Deterministic given the seed.
 */
export function choiceOptions(
  target: Country,
  pool: readonly Country[],
  seed: string,
  count = 4
): Country[] {
  const others = seededShuffle(
    pool.filter((c) => c.id !== target.id),
    `speed-choices-${target.id}-${seed}`
  ).slice(0, Math.max(0, count - 1));
  return seededShuffle([target, ...others], `speed-shuffle-${target.id}-${seed}`);
}
