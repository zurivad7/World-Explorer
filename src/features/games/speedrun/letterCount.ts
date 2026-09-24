import type { Country } from '@/types';
import { seededShuffle } from '@/lib/game-engine';
import { countries } from '@/data';
import { nameLetters, type CountryResolver } from './countryLetters';

/**
 * "Letter Count Blitz" Speed Run — name as many countries as you can whose name has
 * an exact number of letters (e.g. 5 → India, China, Niger; 7 → Nigeria). Pure and
 * unit-tested; the screen owns the timer and the running list.
 *
 * Design decision: only ONE-WORD country names are answerable, so "how many letters?"
 * is never ambiguous (there is no arguing whether "South Korea" is 10 letters or two
 * words). The prompt says so, and multi-word names are judged as not counting.
 */

export { buildResolver, type CountryResolver } from './countryLetters';

/** Whether a country's name is a single word (no spaces or hyphens) — the only answerable kind. */
export function isSingleWord(country: Country): boolean {
  return !/[\s-]/.test(country.name);
}

/** The letter count for a single-word name (accents/punctuation stripped, so it's pure a–z). */
export function countryLetterCount(country: Country): number {
  return nameLetters(country.name).length;
}

/**
 * Minimum countries a length must have to be offered, so a round is never a near-instant
 * dead end. With the current dataset this yields the rich, playable band 4–10 letters
 * (11+ has too few one-word names to be fun).
 */
const MIN_FOR_LENGTH = 6;

/** Every active, single-word country whose name has exactly `len` letters (the round's answer set). */
export function countriesForLength(
  len: number,
  source: readonly Country[] = countries
): Country[] {
  return source.filter((c) => c.active && isSingleWord(c) && countryLetterCount(c) === len);
}

/** Letter counts that have at least the minimum number of one-word countries, ascending. */
export function playableLengths(source: readonly Country[] = countries): number[] {
  const counts = new Map<number, number>();
  for (const c of source) {
    if (!c.active || !isSingleWord(c)) continue;
    const n = countryLetterCount(c);
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= MIN_FOR_LENGTH)
    .map(([len]) => len)
    .sort((a, b) => a - b);
}

/** Pick a playable length deterministically from a seed (undefined only if none qualify). */
export function pickLength(seed: string, source: readonly Country[] = countries): number | undefined {
  return seededShuffle(playableLengths(source), `lengths-${seed}`)[0];
}

export type LengthOutcome =
  | { status: 'correct'; country: Country }
  | { status: 'wrong-length'; country: Country; reason: 'multi-word' | 'length' }
  | { status: 'duplicate'; country: Country }
  | { status: 'unknown' }; // not a recognised country

/**
 * Judge one typed guess for a round: is it a country, is it a one-word name of the right
 * length, and has it already been named? `named` is the set of country ids accepted so far.
 */
export function judgeLengthGuess(
  typed: string,
  len: number,
  named: ReadonlySet<string>,
  resolver: CountryResolver
): LengthOutcome {
  const country = resolver.resolve(typed);
  if (!country) return { status: 'unknown' };
  if (!isSingleWord(country)) return { status: 'wrong-length', country, reason: 'multi-word' };
  if (countryLetterCount(country) !== len) return { status: 'wrong-length', country, reason: 'length' };
  if (named.has(country.id)) return { status: 'duplicate', country };
  return { status: 'correct', country };
}
