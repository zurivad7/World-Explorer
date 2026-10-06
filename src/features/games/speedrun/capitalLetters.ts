import type { Country } from '@/types';
import { normalizeAnswer, seededShuffle } from '@/lib/game-engine';
import { countries } from '@/data';

/**
 * "Capital Letters" Speed Run — name as many CAPITAL CITIES as you can that start
 * with a given letter before a two-minute clock runs out. The capitals sibling of
 * Country Letters. Pure and unit-tested; the screen owns the timer and running list.
 */

/** How long a Capital Letters round lasts — two minutes, as the game is wide (a whole letter). */
export const CAPITAL_LETTERS_SECONDS = 120;

/**
 * Minimum capitals a letter must have to be offered, so a two-minute round has enough
 * to chase and never ends almost immediately. With the current dataset this yields a
 * good spread (A, B, C, D, K, L, M, N, P, R, S, T, V) and drops the near-empty letters
 * (I, Q, U, Z each have one capital; F has two).
 */
const MIN_FOR_LETTER = 6;

/** The first a–z letter of a country's capital (accents/punctuation stripped). */
export function capitalFirstLetter(country: Country): string {
  const match = normalizeAnswer(country.capital).match(/[a-z]/);
  return match ? match[0] : '';
}

/** Every active country whose capital starts with `letter` (the round's answer set). */
export function capitalsForLetter(
  letter: string,
  source: readonly Country[] = countries
): Country[] {
  return source.filter((c) => c.active && c.capital.length > 0 && capitalFirstLetter(c) === letter);
}

/** Letters a–z that have at least the minimum number of capitals. */
export function playableLetters(source: readonly Country[] = countries): string[] {
  const out: string[] = [];
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(97 + i);
    if (capitalsForLetter(letter, source).length >= MIN_FOR_LETTER) out.push(letter);
  }
  return out;
}

/** Pick a playable letter deterministically from a seed (undefined only if none qualify). */
export function pickLetter(seed: string, source: readonly Country[] = countries): string | undefined {
  return seededShuffle(playableLetters(source), `capital-letters-${seed}`)[0];
}

export interface CapitalResolver {
  /** Resolve typed text to the country whose capital it names, or undefined. */
  resolve(typed: string): Country | undefined;
}

/**
 * Build a forgiving capital→country lookup: the normalised capital, the part before a
 * comma ("Washington" for "Washington, D.C."), and "saint"/"st" spelling variants (so
 * "Saint John's" and "St. George's" both resolve either way). Match is exact on the
 * normalised forms, never a substring.
 */
export function buildCapitalResolver(source: readonly Country[] = countries): CapitalResolver {
  const byKey = new Map<string, Country>();
  const add = (key: string, c: Country): void => {
    const k = normalizeAnswer(key);
    if (k && !byKey.has(k)) byKey.set(k, c);
  };
  for (const c of source) {
    if (!c.active || c.capital.length === 0) continue;
    const norm = normalizeAnswer(c.capital);
    add(norm, c);
    const beforeComma = c.capital.split(',')[0];
    if (beforeComma) add(beforeComma, c); // "Washington, D.C." → "washington"
    if (/\bsaint\b/.test(norm)) add(norm.replace(/\bsaint\b/g, 'st'), c); // Saint John's → St John's
    if (/\bst\b/.test(norm)) add(norm.replace(/\bst\b/g, 'saint'), c); // St. George's → Saint George's
  }
  return {
    resolve: (typed) => byKey.get(normalizeAnswer(typed)),
  };
}

export type CapitalGuessOutcome =
  | { status: 'correct'; country: Country }
  | { status: 'wrong-letter'; country: Country } // a real capital, but not for this letter
  | { status: 'duplicate'; country: Country }
  | { status: 'unknown' }; // not a recognised capital

/**
 * Judge one typed guess: is it a capital, does it start with the letter, and has it
 * already been named? `named` is the set of country ids accepted so far.
 */
export function judgeCapitalGuess(
  typed: string,
  letter: string,
  named: ReadonlySet<string>,
  resolver: CapitalResolver
): CapitalGuessOutcome {
  const country = resolver.resolve(typed);
  if (!country) return { status: 'unknown' };
  if (capitalFirstLetter(country) !== letter) return { status: 'wrong-letter', country };
  if (named.has(country.id)) return { status: 'duplicate', country };
  return { status: 'correct', country };
}
