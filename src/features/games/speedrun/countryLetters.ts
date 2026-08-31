import type { Country } from '@/types';
import { normalizeAnswer, seededShuffle } from '@/lib/game-engine';
import { countries } from '@/data';

/**
 * "Country Letters" Speed Run — name as many countries as you can that either
 * START WITH a given letter or CONTAIN it, before the clock runs out. Pure and
 * unit-tested; the screen owns the timer and running list.
 */

export type LetterRule = 'starts' | 'contains';

export interface LetterRuleMeta {
  rule: LetterRule;
  title: string;
  /** Seconds on the clock — "contains" is easier, so it gets a little less time. */
  seconds: number;
  /** Prompt verb, e.g. "start with" / "contain". */
  verb: string;
}

export const LETTER_RULES: Record<LetterRule, LetterRuleMeta> = {
  starts: { rule: 'starts', title: 'Starts with', seconds: 45, verb: 'start with' },
  contains: { rule: 'contains', title: 'Contains', seconds: 60, verb: 'contain' },
};

/**
 * Minimum countries a letter must have to be offered for a rule, so a round is
 * never a near-instant dead end. This also removes the letters with no starting
 * country at all (W, X) from "starts with".
 */
const MIN_FOR_RULE: Record<LetterRule, number> = { starts: 2, contains: 6 };

/** A country name reduced to its ascii letters (accents, spaces, punctuation removed). */
export function nameLetters(name: string): string {
  return normalizeAnswer(name).replace(/[^a-z]/g, '');
}

/** Whether a country satisfies the rule for `letter` (a single lowercase a–z). */
export function matchesRule(country: Country, letter: string, rule: LetterRule): boolean {
  const letters = nameLetters(country.name);
  return rule === 'starts' ? letters.startsWith(letter) : letters.includes(letter);
}

/** Every active country that satisfies the rule for a letter (the round's answer set). */
export function countriesForLetter(
  letter: string,
  rule: LetterRule,
  source: readonly Country[] = countries
): Country[] {
  return source.filter((c) => c.active && matchesRule(c, letter, rule));
}

/** Letters a–z that have at least the minimum number of countries for this rule. */
export function playableLetters(
  rule: LetterRule,
  source: readonly Country[] = countries
): string[] {
  const min = MIN_FOR_RULE[rule];
  const out: string[] = [];
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(97 + i);
    if (countriesForLetter(letter, rule, source).length >= min) out.push(letter);
  }
  return out;
}

/** Pick a playable letter deterministically from a seed (undefined only if none qualify). */
export function pickLetter(
  rule: LetterRule,
  seed: string,
  source: readonly Country[] = countries
): string | undefined {
  return seededShuffle(playableLetters(rule, source), `letters-${rule}-${seed}`)[0];
}

/**
 * Common short forms and alternate spellings a child might type, keyed by country id,
 * so answers like "USA" or "St Lucia" still count. The *canonical* name still governs
 * whether the letter rule is satisfied.
 */
const ALIASES: Record<string, string[]> = {
  us: ['usa', 'us', 'america', 'united states of america'],
  gb: ['uk', 'britain', 'great britain', 'england'],
  ci: ['cote divoire', 'cote d ivoire'],
  cd: ['drc', 'democratic republic of the congo', 'congo kinshasa'],
  cg: ['congo', 'congo brazzaville'],
  ae: ['uae', 'emirates'],
  cz: ['czech republic'],
  sz: ['swaziland'],
  mm: ['burma'],
  cv: ['cabo verde'],
  tl: ['east timor', 'timor'],
  va: ['vatican', 'holy see'],
  nl: ['holland'],
};

export interface CountryResolver {
  /** Resolve typed text to a country, or undefined if it is not a recognised name. */
  resolve(typed: string): Country | undefined;
}

/**
 * Build a forgiving name→country lookup: the canonical name, a variant with " and "
 * dropped (so "Antigua & Barbuda" matches "Antigua and Barbuda"), a "saint"→"st"
 * variant, and the authored aliases. Match is exact on the normalised forms — never a
 * substring — so a short word can't accidentally match many countries.
 */
export function buildResolver(source: readonly Country[] = countries): CountryResolver {
  const byKey = new Map<string, Country>();
  const add = (key: string, c: Country): void => {
    const k = normalizeAnswer(key);
    if (k && !byKey.has(k)) byKey.set(k, c);
  };
  for (const c of source) {
    if (!c.active) continue;
    const norm = normalizeAnswer(c.name);
    add(norm, c);
    add(norm.replace(/\band\b/g, ' '), c); // "antigua and barbuda" → "antigua barbuda"
    add(norm.replace(/\bsaint\b/g, 'st'), c); // "saint lucia" → "st lucia"
    for (const alias of ALIASES[c.id] ?? []) add(alias, c);
  }
  return {
    resolve: (typed) => byKey.get(normalizeAnswer(typed)),
  };
}

export type GuessOutcome =
  | { status: 'correct'; country: Country }
  | { status: 'wrong-letter'; country: Country } // a real country, but not for this letter
  | { status: 'duplicate'; country: Country }
  | { status: 'unknown' }; // not a recognised country

/**
 * Judge one typed guess for a round: is it a country, does it fit the letter rule, and
 * has it already been named? `named` is the set of country ids accepted so far.
 */
export function judgeGuess(
  typed: string,
  letter: string,
  rule: LetterRule,
  named: ReadonlySet<string>,
  resolver: CountryResolver
): GuessOutcome {
  const country = resolver.resolve(typed);
  if (!country) return { status: 'unknown' };
  if (!matchesRule(country, letter, rule)) return { status: 'wrong-letter', country };
  if (named.has(country.id)) return { status: 'duplicate', country };
  return { status: 'correct', country };
}
