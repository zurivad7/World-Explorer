import type { AgeBand, Country, Difficulty, Question } from '@/types';
import type { CountrySource } from './countries/source';
import type { FlagTemplate } from './flags/templates';

/**
 * Deterministic content generators (PRD §10, §24).
 *
 * These are **not** AI-generated questions: they are templated from reviewed
 * country data (PRD §4). Given the same inputs they always produce the same
 * output, so the generated bank is reproducible and reviewable. The build script
 * (scripts/build-content.ts) runs these and commits the JSON output.
 */

export interface GeneratorInputs {
  countries: Country[];
  /** Difficulty hints keyed by country id. */
  hints: Map<string, Pick<CountrySource, 'mapSize' | 'similarFlag'>>;
  templates: FlagTemplate[];
  /**
   * Authored "commonly mistaken for the capital" cities keyed by country id, used
   * as teachable distractors in the capital quiz (e.g. Lagos for Nigeria).
   */
  trickyCapitals?: Map<string, string[]>;
  /** Country ids that have a silhouette, so a Shape Detective question can be made. */
  shapeCountryIds?: ReadonlySet<string>;
}

const AGE_BY_DIFFICULTY: Record<Difficulty, AgeBand[]> = {
  easy: ['5-7', '8-10'],
  medium: ['8-10', '11-13'],
  hard: ['11-13'],
};

const SOURCE = 'generated:world-explorer';

function ageBands(difficulty: Difficulty): AgeBand[] {
  return [...AGE_BY_DIFFICULTY[difficulty]];
}

/**
 * Pick `count` deterministic distractors for `target` from `pool`, preferring
 * same-continent countries (more plausible), then stable alphabetical order.
 * `rotate` shifts the selection window so different question types don't always
 * reuse the identical distractor set.
 */
function pickDistractors(
  target: Country,
  pool: Country[],
  count: number,
  rotate: number
): Country[] {
  const candidates = pool
    .filter((c) => c.id !== target.id)
    .sort((a, b) => {
      const aSame = a.continent === target.continent ? 0 : 1;
      const bSame = b.continent === target.continent ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return a.name.localeCompare(b.name);
    });
  if (candidates.length <= count) return candidates;
  const start = rotate % candidates.length;
  const result: Country[] = [];
  for (let i = 0; result.length < count && i < candidates.length; i++) {
    const item = candidates[(start + i) % candidates.length];
    if (item && !result.includes(item)) result.push(item);
  }
  return result;
}

/** Deterministic shuffle (Fisher–Yates seeded by a string) so option order is stable. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = (Math.imul(h, 48271) + 1) & 0x7fffffff;
    const j = h % (i + 1);
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/**
 * Pick `count` deterministic text distractors for a "good to know" fact question
 * (language, currency, dialing code, domain). Draws from `pool` of all values,
 * excluding the correct answer and anything in `exclude` (e.g. every language the
 * country actually speaks, so a real answer is never offered as a wrong option).
 */
function valueDistractors(
  correct: string,
  pool: string[],
  exclude: Set<string>,
  count: number,
  seed: string
): string[] {
  const candidates = seededShuffle(
    pool.filter((v) => v !== correct && !exclude.has(v)),
    seed
  );
  return candidates.slice(0, count);
}

function flagDifficulty(hint?: Pick<CountrySource, 'mapSize' | 'similarFlag'>): Difficulty {
  if (hint?.similarFlag) return 'hard';
  if (hint?.mapSize === 'large') return 'easy';
  return 'medium';
}

function mapDifficulty(hint?: Pick<CountrySource, 'mapSize' | 'similarFlag'>): Difficulty {
  if (hint?.mapSize === 'small') return 'hard';
  if (hint?.mapSize === 'large') return 'easy';
  return 'medium';
}

const northern = (c: Country): boolean => (c.latlng ? c.latlng[0] >= 0 : true);

/**
 * Canonical encoding of a multi-select answer: the chosen ids sorted and joined, so a
 * player's picks compare equal to the correct set by plain string equality (letting
 * the existing single-string answer engine score "select all that apply" unchanged).
 */
export const encodeSelection = (ids: string[]): string => [...ids].sort().join('+');

/** Great-circle distance in km between two [lat, lng] points (haversine). */
function distanceKm(a: readonly [number, number], b: readonly [number, number]): number {
  const R = 6371;
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * "Closest Country": given an anchor country, which of four options is nearest to
 * it? Direct neighbours are excluded (so it tests distance intuition, not borders),
 * and the three distractors are drawn from clearly-further countries so the nearest
 * is unambiguous.
 */
function makeClosest(c: Country, countries: Country[]): Question | null {
  if (!c.latlng) return null;
  const anchor = c.latlng;
  const ranked = countries
    .filter((x) => x.id !== c.id && x.latlng && !c.neighbours.includes(x.id))
    .map((x) => ({ x, d: distanceKm(anchor, x.latlng!) }))
    .sort((a, b) => a.d - b.d);
  if (ranked.length < 6) return null;
  const nearest = ranked[0]!;
  const further = ranked.slice(1);
  // Spread the distractors across the "further" range so none rivals the nearest.
  const distractors = [0.2, 0.5, 0.85]
    .map((f) => further[Math.min(further.length - 1, Math.floor(further.length * f))]!)
    .map((r) => r.x);
  const optionIds = [nearest.x.id, ...distractors.map((d) => d.id)];
  if (new Set(optionIds).size !== 4) return null; // a distractor coincided; skip
  const options = seededShuffle(optionIds, `close-opt-${c.id}`);
  return {
    id: `closest-country-${c.id}`,
    type: 'closest-country',
    difficulty: 'medium',
    ageBands: ageBands('medium'),
    topic: 'location',
    prompt: `Which of these countries is closest to ${c.name}?`,
    options,
    correctAnswer: nearest.x.id,
    explanation: `${nearest.x.name} is the closest to ${c.name} of these four.`,
    countryId: c.id,
    active: true,
    source: SOURCE,
  };
}

/**
 * "Border Battle" (multi-select): given an anchor country, pick every option that
 * shares a land border with it. Options are a mix of real neighbours (up to three) and
 * same-continent non-neighbours; the correct answer is the canonical set of the
 * neighbour option ids (see encodeSelection). Only countries with at least one land
 * neighbour get a question, and there are always some non-neighbours so it is a real
 * "select all that apply".
 */
function makeBorderBattle(
  c: Country,
  countries: Country[],
  byId: Map<string, Country>,
  index: number
): Question | null {
  const neighbourIds = c.neighbours.filter((n) => byId.has(n));
  if (neighbourIds.length === 0) return null;
  const neighbourSet = new Set(c.neighbours);
  const correctPick = seededShuffle(neighbourIds, `border-n-${c.id}`)
    .slice(0, Math.min(3, neighbourIds.length))
    .map((id) => byId.get(id)!);
  const need = 5 - correctPick.length; // five options total
  const distractors = pickDistractors(
    c,
    countries.filter((x) => x.id === c.id || !neighbourSet.has(x.id)),
    need,
    index
  );
  if (distractors.length < need) return null; // not enough non-neighbours to fill out
  const options = seededShuffle(
    [...correctPick.map((x) => x.id), ...distractors.map((x) => x.id)],
    `border-opt-${c.id}`
  );
  const correctIds = options.filter((id) => neighbourSet.has(id));
  return {
    id: `border-battle-${c.id}`,
    type: 'border-battle',
    difficulty: 'medium',
    ageBands: ageBands('medium'),
    topic: 'location',
    prompt: `Which of these countries share a border with ${c.name}? Pick all that apply.`,
    options,
    correctAnswer: encodeSelection(correctIds),
    explanation: `${c.name} shares a land border with ${correctPick.map((x) => x.name).join(', ')}.`,
    countryId: c.id,
    active: true,
    source: SOURCE,
  };
}

interface OddGroup {
  group: Country[];
  explanation: string;
}

/**
 * "Odd One Out": three countries share one clear trait and `c` does not, so `c` is
 * the intended answer. Several traits are tried in a rotated order (continent,
 * currency, language, hemisphere, and — last, so it stays rare — landlocked/coast),
 * which keeps the questions varied. The explanation always states the grouping.
 */
function makeOddOneOut(c: Country, countries: Country[], index: number): Question | null {
  const pool = seededShuffle(
    countries.filter((x) => x.id !== c.id),
    `odd-${c.id}`
  );
  const names = (g: Country[]): string => g.map((x) => x.name).join(', ');

  const byContinent = (): OddGroup | null => {
    const continents = seededShuffle(
      [...new Set(pool.map((x) => x.continent))].filter((k) => k !== c.continent),
      `odd-cont-${c.id}`
    );
    for (const continent of continents) {
      const g = pool.filter((x) => x.continent === continent).slice(0, 3);
      if (g.length === 3) {
        return { group: g, explanation: `${names(g)} are all in ${continent}, but ${c.name} is in ${c.continent}.` };
      }
    }
    return null;
  };

  const byCurrency = (): OddGroup | null => {
    if (!c.currency) return null;
    const buckets = new Map<string, Country[]>();
    for (const x of pool) {
      if (x.currency && x.currency.code !== c.currency.code) {
        (buckets.get(x.currency.code) ?? buckets.set(x.currency.code, []).get(x.currency.code)!).push(x);
      }
    }
    for (const code of seededShuffle([...buckets.keys()], `odd-cur-${c.id}`)) {
      const g = buckets.get(code)!.slice(0, 3);
      if (g.length === 3) {
        return {
          group: g,
          explanation: `${names(g)} all use the ${g[0]!.currency!.name}, but ${c.name} uses the ${c.currency.name}.`,
        };
      }
    }
    return null;
  };

  const byLanguage = (): OddGroup | null => {
    if (c.languages.length === 0) return null;
    const cLangs = new Set(c.languages);
    const buckets = new Map<string, Country[]>();
    for (const x of pool) {
      for (const lang of x.languages) {
        if (!cLangs.has(lang)) {
          (buckets.get(lang) ?? buckets.set(lang, []).get(lang)!).push(x);
        }
      }
    }
    for (const lang of seededShuffle([...buckets.keys()], `odd-lang-${c.id}`)) {
      const g = buckets.get(lang)!.slice(0, 3);
      if (g.length === 3) {
        return { group: g, explanation: `${names(g)} all speak ${lang}, but ${c.name} does not.` };
      }
    }
    return null;
  };

  const byHemisphere = (): OddGroup | null => {
    if (!c.latlng) return null;
    const cNorth = northern(c);
    const g = pool.filter((x) => x.latlng && northern(x) !== cNorth).slice(0, 3);
    if (g.length !== 3) return null;
    return {
      group: g,
      explanation: cNorth
        ? `${names(g)} are all south of the equator, but ${c.name} is north of it.`
        : `${names(g)} are all north of the equator, but ${c.name} is south of it.`,
    };
  };

  const byLandlocked = (): OddGroup | null => {
    const want = !c.landlocked;
    const g = pool.filter((x) => x.landlocked === want).slice(0, 3);
    if (g.length !== 3) return null;
    return {
      group: g,
      explanation: want
        ? `${names(g)} are all landlocked, but ${c.name} has a sea coast.`
        : `${names(g)} all have a sea coast, but ${c.name} is landlocked.`,
    };
  };

  // Rotate the four varied traits; landlocked/coast is appended last (never rotated
  // to the front) so it only appears as a rare fallback when the others can't apply.
  const rotatable = [byContinent, byCurrency, byLanguage, byHemisphere];
  const start = index % rotatable.length;
  const order = [...rotatable.slice(start), ...rotatable.slice(0, start), byLandlocked];
  let built: OddGroup | null = null;
  for (const build of order) {
    built = build();
    if (built) break;
  }
  if (!built) return null;

  const options = seededShuffle([c.id, ...built.group.map((g) => g.id)], `odd-opt-${c.id}`);
  return {
    id: `odd-one-out-${c.id}`,
    type: 'odd-one-out',
    difficulty: 'medium',
    ageBands: ageBands('medium'),
    topic: 'reasoning',
    prompt: 'Three of these belong together. Which is the odd one out?',
    options,
    correctAnswer: c.id,
    explanation: built.explanation,
    countryId: c.id,
    active: true,
    source: SOURCE,
  };
}

type FactCategory = 'capital' | 'continent' | 'coast' | 'border' | 'currency';
interface Fact {
  text: string;
  cat: FactCategory;
}
interface FalseFact extends Fact {
  why: string;
}

/**
 * "Find the Lie" (two truths and a lie): two verifiable true statements about `c`
 * plus one false one; the player picks the false statement. The lie is always about
 * a *different* attribute than the two truths (so a true "capital is Paris" never
 * sits beside a false "capital is …"), and every lie carries its correction.
 */
function makeFindTheLie(
  c: Country,
  countries: Country[],
  byId: Map<string, Country>,
  index: number
): Question | null {
  const trueFacts: Fact[] = [
    { text: `${c.name}'s capital city is ${c.capital}.`, cat: 'capital' },
    { text: `${c.name} is in ${c.continent}.`, cat: 'continent' },
    {
      text: c.landlocked ? `${c.name} is landlocked, with no sea coast.` : `${c.name} has a sea coast.`,
      cat: 'coast',
    },
  ];
  const neighbourName = c.neighbours.map((n) => byId.get(n)?.name).find(Boolean);
  if (neighbourName) {
    trueFacts.push({ text: `${c.name} shares a land border with ${neighbourName}.`, cat: 'border' });
  }
  if (c.currency) trueFacts.push({ text: `${c.name} uses the ${c.currency.name}.`, cat: 'currency' });

  const others = pickDistractors(c, countries, 5, index);
  const falseFacts: FalseFact[] = [];
  const wrongCapital = others.find((o) => o.capital !== c.capital)?.capital;
  if (wrongCapital) {
    falseFacts.push({
      text: `${c.name}'s capital city is ${wrongCapital}.`,
      why: `${c.name}'s capital is actually ${c.capital}.`,
      cat: 'capital',
    });
  }
  const wrongContinent = seededShuffle(
    [...new Set(countries.map((x) => x.continent))].filter((k) => k !== c.continent),
    `lie-cont-${c.id}`
  )[0];
  if (wrongContinent) {
    falseFacts.push({
      text: `${c.name} is in ${wrongContinent}.`,
      why: `${c.name} is actually in ${c.continent}.`,
      cat: 'continent',
    });
  }
  const nonNeighbour = others.find((o) => o.id !== c.id && !c.neighbours.includes(o.id));
  if (nonNeighbour) {
    falseFacts.push({
      text: `${c.name} shares a land border with ${nonNeighbour.name}.`,
      why: `${c.name} does not share a land border with ${nonNeighbour.name}.`,
      cat: 'border',
    });
  }
  falseFacts.push(
    c.landlocked
      ? { text: `${c.name} has a long sea coast.`, why: `${c.name} is actually landlocked.`, cat: 'coast' }
      : {
          text: `${c.name} is landlocked, with no sea coast.`,
          why: `${c.name} actually has a sea coast.`,
          cat: 'coast',
        }
  );

  const trues = seededShuffle(trueFacts, `lie-true-${c.id}`).slice(0, 2);
  if (trues.length < 2) return null;
  const usedCats = new Set(trues.map((t) => t.cat));
  const lie =
    seededShuffle(falseFacts, `lie-false-${c.id}`).find((f) => !usedCats.has(f.cat)) ?? null;
  if (!lie) return null;
  const optionSet = [...trues.map((t) => t.text), lie.text];
  if (new Set(optionSet).size !== optionSet.length) return null; // guard against a coincidental clash
  const options = seededShuffle(optionSet, `lie-opt-${c.id}`);
  return {
    id: `find-the-lie-${c.id}`,
    type: 'find-the-lie',
    difficulty: 'medium',
    ageBands: ageBands('medium'),
    topic: 'reasoning',
    prompt: `Two of these facts about ${c.name} are true and one is false. Which one is the lie?`,
    options,
    correctAnswer: lie.text,
    explanation: lie.why,
    countryId: c.id,
    active: true,
    source: SOURCE,
  };
}

interface CommonGroup {
  group: Country[]; // the three subject countries (includes c)
  truth: string; // statement true of all three
}

/** Latitude of the tropics (±23.5°); within this band a country is "in the tropics". */
const TROPIC_LAT = 23.5;

/**
 * Every statement that is guaranteed **false** for the whole `group`, across many
 * categories (continent, currency, language, hemisphere N/S, hemisphere E/W, the
 * tropics, and landlocked/coast). Because distractors are drawn from this mixed pool
 * rather than a single category, the four options vary from question to question
 * instead of always being "four continents" or "four currencies". A statement is
 * only added when it is false for *every* member, so the one true option stays unique.
 */
function commonFalseStatements(
  group: Country[],
  truth: string,
  allContinents: string[],
  allCurrencies: string[],
  allLanguages: string[],
  seed: string
): string[] {
  const out: string[] = [];
  const push = (s: string): void => {
    if (s !== truth && !out.includes(s)) out.push(s);
  };

  // Continents / currencies / languages that NO member has, so "they all …" is false.
  const groupContinents = new Set<string>(group.map((g) => g.continent));
  for (const k of allContinents.filter((k) => !groupContinents.has(k))) push(`They are all in ${k}.`);

  const groupCurrencies = new Set(
    group.map((g) => g.currency?.name).filter((n): n is string => Boolean(n))
  );
  for (const n of allCurrencies.filter((n) => !groupCurrencies.has(n))) push(`They all use the ${n}.`);

  const groupLangs = new Set(group.flatMap((g) => g.languages));
  for (const l of allLanguages.filter((l) => !groupLangs.has(l))) push(`They all speak ${l}.`);

  // Position statements — added only when actually false for the whole group.
  if (group.every((g) => g.latlng)) {
    const lat = (g: Country): number => g.latlng![0];
    const lng = (g: Country): number => g.latlng![1];
    if (!group.every((g) => lat(g) >= 0)) push('They are all north of the equator.');
    if (!group.every((g) => lat(g) < 0)) push('They are all south of the equator.');
    if (!group.every((g) => lng(g) >= 0))
      push('They are all east of the Prime Meridian (Eastern Hemisphere).');
    if (!group.every((g) => lng(g) < 0))
      push('They are all west of the Prime Meridian (Western Hemisphere).');
    if (!group.every((g) => Math.abs(lat(g)) <= TROPIC_LAT))
      push('They all lie in the tropics, close to the equator.');
  }

  // Landlocked / coast.
  if (!group.every((g) => g.landlocked)) push('They are all landlocked, with no sea coast.');
  if (!group.every((g) => !g.landlocked)) push('They all have a sea coast.');

  return seededShuffle(out, seed);
}

/**
 * "In Common": show three countries and ask what they share. Exactly one option is
 * true of all three; the trait is rotated across many kinds — continent, an
 * (obscure-first) shared language, hemisphere north/south, hemisphere east/west, the
 * tropics, a shared currency, and landlocked/coast — so questions do not feel repetitive
 * and use varied country groupings. The three distractors are drawn from a mixed pool
 * of statements guaranteed false for the whole group (see commonFalseStatements), so
 * there is always exactly one correct answer. The three flags are shown via subjectIds.
 */
function makeInCommon(
  c: Country,
  countries: Country[],
  allContinents: string[],
  allCurrencies: string[],
  allLanguages: string[],
  langFreq: Map<string, number>,
  index: number
): Question | null {
  const pool = countries.filter((x) => x.id !== c.id);
  const mates = (predicate: (x: Country) => boolean, seed: string): Country[] =>
    seededShuffle(pool.filter(predicate), seed).slice(0, 2);

  const byContinent = (): CommonGroup | null => {
    const m = mates((x) => x.continent === c.continent, `common-cont-${c.id}`);
    if (m.length < 2) return null;
    return { group: [c, ...m], truth: `They are all in ${c.continent}.` };
  };

  const byCurrency = (): CommonGroup | null => {
    if (!c.currency) return null;
    const { code, name } = c.currency;
    const m = mates((x) => x.currency?.code === code, `common-cur-${c.id}`);
    if (m.length < 2) return null;
    return { group: [c, ...m], truth: `They all use the ${name}.` };
  };

  const byLanguage = (): CommonGroup | null => {
    // Prefer the most "obscure" of c's languages (fewest speakers worldwide) that
    // still has at least two other speakers, so groupings are varied and less obvious
    // than always defaulting to a widely-spoken language.
    const langs = [...c.languages].sort(
      (a, b) => (langFreq.get(a) ?? 0) - (langFreq.get(b) ?? 0)
    );
    for (const lang of langs) {
      const m = mates((x) => x.languages.includes(lang), `common-lang-${lang}-${c.id}`);
      if (m.length < 2) continue;
      return { group: [c, ...m], truth: `They all speak ${lang}.` };
    }
    return null;
  };

  const byNorthSouth = (): CommonGroup | null => {
    if (!c.latlng) return null;
    const north = c.latlng[0] >= 0;
    const m = mates((x) => Boolean(x.latlng) && x.latlng![0] >= 0 === north, `common-ns-${c.id}`);
    if (m.length < 2) return null;
    return {
      group: [c, ...m],
      truth: north ? 'They are all north of the equator.' : 'They are all south of the equator.',
    };
  };

  const byEastWest = (): CommonGroup | null => {
    if (!c.latlng) return null;
    const east = c.latlng[1] >= 0;
    const m = mates((x) => Boolean(x.latlng) && x.latlng![1] >= 0 === east, `common-ew-${c.id}`);
    if (m.length < 2) return null;
    return {
      group: [c, ...m],
      truth: east
        ? 'They are all east of the Prime Meridian (Eastern Hemisphere).'
        : 'They are all west of the Prime Meridian (Western Hemisphere).',
    };
  };

  const byTropics = (): CommonGroup | null => {
    if (!c.latlng || Math.abs(c.latlng[0]) > TROPIC_LAT) return null;
    const m = mates(
      (x) => Boolean(x.latlng) && Math.abs(x.latlng![0]) <= TROPIC_LAT,
      `common-trop-${c.id}`
    );
    if (m.length < 2) return null;
    return { group: [c, ...m], truth: 'They all lie in the tropics, close to the equator.' };
  };

  const byLandlocked = (): CommonGroup | null => {
    const m = mates((x) => x.landlocked === c.landlocked, `common-ll-${c.id}`);
    if (m.length < 2) return null;
    return {
      group: [c, ...m],
      truth: c.landlocked
        ? 'They are all landlocked, with no sea coast.'
        : 'They all have a sea coast.',
    };
  };

  // Rotate through the trait builders by index so consecutive countries lead with a
  // different kind of shared trait (and therefore different country groupings).
  const builders = [
    byContinent,
    byLanguage,
    byNorthSouth,
    byEastWest,
    byTropics,
    byCurrency,
    byLandlocked,
  ];
  const start = index % builders.length;
  const order = [...builders.slice(start), ...builders.slice(0, start)];
  let built: CommonGroup | null = null;
  for (const build of order) {
    built = build();
    if (built) break;
  }
  if (!built) return null;

  const distractors = commonFalseStatements(
    built.group,
    built.truth,
    allContinents,
    allCurrencies,
    allLanguages,
    `common-f-${c.id}`
  );
  if (distractors.length < 3) return null;
  const options = seededShuffle([built.truth, ...distractors.slice(0, 3)], `common-opt-${c.id}`);
  if (new Set(options).size !== 4) return null; // a distractor coincided; skip
  const names = built.group.map((g) => g.name).join(', ');
  return {
    id: `in-common-${c.id}`,
    type: 'in-common',
    difficulty: 'medium',
    ageBands: ageBands('medium'),
    topic: 'reasoning',
    prompt: 'What do these three countries have in common?',
    options,
    correctAnswer: built.truth,
    explanation: `${names} ${built.truth.replace(/^They /, '')}`,
    countryId: c.id,
    subjectIds: built.group.map((g) => g.id),
    active: true,
    source: SOURCE,
  };
}

export function generateQuestions(inputs: GeneratorInputs): Question[] {
  const { countries, hints, templates, trickyCapitals, shapeCountryIds } = inputs;
  const questions: Question[] = [];
  const byId = new Map(countries.map((c) => [c.id, c]));

  // Value pools for "good to know" fact questions (distractors are drawn from
  // real values other countries have, so wrong options still look plausible).
  const uniq = (values: string[]): string[] => [...new Set(values)].sort();
  const allLanguages = uniq(countries.flatMap((c) => c.languages));
  const allCurrencies = uniq(countries.map((c) => c.currency?.name ?? '').filter(Boolean));
  const allContinents = uniq(countries.map((c) => c.continent));
  // How many countries speak each language, so "In Common" can prefer obscure ties.
  const langFreq = new Map<string, number>();
  for (const c of countries) {
    for (const l of c.languages) langFreq.set(l, (langFreq.get(l) ?? 0) + 1);
  }
  const allCallingCodes = uniq(countries.map((c) => c.callingCode ?? '').filter(Boolean));
  const allTlds = uniq(countries.map((c) => c.tld ?? '').filter(Boolean));

  countries.forEach((c, index) => {
    const hint = hints.get(c.id);

    // --- Flag Detective: flag → country ---
    {
      const difficulty = flagDifficulty(hint);
      const distractors = pickDistractors(c, countries, 3, index);
      const options = seededShuffle([c.id, ...distractors.map((d) => d.id)], `flag-c-${c.id}`);
      questions.push({
        id: `flag-detective-flag-${c.id}`,
        type: 'flag-detective',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'flags',
        prompt: 'Which country does this flag belong to?',
        options,
        correctAnswer: c.id,
        explanation: `This is the flag of ${c.name}. Its capital is ${c.capital} and it is in ${c.continent}.`,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Flag Detective: country → flag ---
    {
      const difficulty = flagDifficulty(hint);
      const distractors = pickDistractors(c, countries, 3, index + 1);
      const options = seededShuffle([c.id, ...distractors.map((d) => d.id)], `flag-f-${c.id}`);
      questions.push({
        id: `flag-detective-country-${c.id}`,
        type: 'flag-detective',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'flags',
        prompt: `Which flag belongs to ${c.name}?`,
        options,
        correctAnswer: c.id,
        explanation: `${c.name}'s flag is shown. Its capital is ${c.capital}.`,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Capital Challenge: country → capital ---
    {
      const difficulty = mapDifficulty(hint);
      // Include authored "commonly mistaken for the capital" cities as teachable
      // distractors (e.g. Lagos for Nigeria), dropping any that equal the real
      // capital; then fill the remaining slots with other countries' capitals.
      const traps = (trickyCapitals?.get(c.id) ?? [])
        .filter((t) => t.toLowerCase() !== c.capital.toLowerCase())
        .slice(0, 2);
      const seen = new Set<string>([c.capital.toLowerCase(), ...traps.map((t) => t.toLowerCase())]);
      const need = 3 - traps.length;
      const fillers: string[] = [];
      for (const d of pickDistractors(c, countries, need + 3, index + 2)) {
        if (fillers.length >= need) break;
        const key = d.capital.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          fillers.push(d.capital);
        }
      }
      const options = seededShuffle([c.capital, ...traps, ...fillers], `cap-c-${c.id}`);
      const explanation = c.capitalNote
        ? `The capital of ${c.name} is ${c.capital}. ${c.capitalNote}`
        : `The capital of ${c.name} is ${c.capital}.`;
      questions.push({
        id: `capital-challenge-capital-${c.id}`,
        type: 'capital-challenge',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'capitals',
        prompt: `What is the capital of ${c.name}?`,
        options,
        correctAnswer: c.capital,
        explanation,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Capital Challenge: capital → country ---
    {
      const difficulty = mapDifficulty(hint);
      const distractors = pickDistractors(c, countries, 3, index + 3);
      const options = seededShuffle([c.id, ...distractors.map((d) => d.id)], `cap-o-${c.id}`);
      questions.push({
        id: `capital-challenge-country-${c.id}`,
        type: 'capital-challenge',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'capitals',
        prompt: `${c.capital} is the capital of which country?`,
        options,
        correctAnswer: c.id,
        explanation: `${c.capital} is the capital of ${c.name}.`,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Continent Challenge: country → continent ---
    {
      const others = [...new Set(countries.map((x) => x.continent))].filter(
        (cont) => cont !== c.continent
      );
      const distractorConts = seededShuffle(others, `cont-${c.id}`).slice(0, 3);
      const options = seededShuffle([c.continent, ...distractorConts], `cont-o-${c.id}`);
      questions.push({
        id: `continent-challenge-${c.id}`,
        type: 'continent-challenge',
        difficulty: 'easy',
        ageBands: ageBands('easy'),
        topic: 'continents',
        prompt: `Which continent is ${c.name} in?`,
        options,
        correctAnswer: c.continent,
        explanation: `${c.name} is in ${c.continent}.`,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Map Find It: find the country ---
    {
      const difficulty = mapDifficulty(hint);
      const distractors = pickDistractors(c, countries, 3, index + 4);
      const options = seededShuffle([c.id, ...distractors.map((d) => d.id)], `map-${c.id}`);
      questions.push({
        id: `map-find-it-${c.id}`,
        type: 'map-find-it',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'location',
        prompt: `Find ${c.name}.`,
        options,
        correctAnswer: c.id,
        explanation: `${c.name} is in ${c.continent}. Its capital is ${c.capital}.`,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Geography Detective: clue-based ---
    {
      const clues: string[] = [`It is in ${c.continent}.`, `Its capital city is ${c.capital}.`];
      const namedNeighbours = c.neighbours
        .map((n) => byId.get(n)?.name)
        .filter((n): n is string => Boolean(n));
      if (namedNeighbours.length > 0) {
        clues.push(`It shares a border with ${namedNeighbours[0]}.`);
      } else {
        clues.push(`Its region is ${c.region}.`);
      }
      // Easier when more clues are given.
      const difficulty: Difficulty = namedNeighbours.length > 0 ? 'medium' : 'hard';
      const distractors = pickDistractors(c, countries, 3, index + 5);
      const options = seededShuffle([c.id, ...distractors.map((d) => d.id)], `det-${c.id}`);
      questions.push({
        id: `geography-detective-${c.id}`,
        type: 'geography-detective',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'clues',
        prompt: `Which country am I? ${clues.join(' ')}`,
        options,
        correctAnswer: c.id,
        explanation: `The answer is ${c.name}, in ${c.continent}, capital ${c.capital}.`,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Shape Detective: name the country from its outline ---
    if (shapeCountryIds?.has(c.id)) {
      const difficulty = mapDifficulty(hint);
      const distractors = pickDistractors(c, countries, 3, index + 6);
      const options = seededShuffle([c.id, ...distractors.map((d) => d.id)], `shape-${c.id}`);
      questions.push({
        id: `shape-detective-${c.id}`,
        type: 'shape-detective',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'shapes',
        prompt: 'Which country has this shape?',
        options,
        correctAnswer: c.id,
        explanation: `This is the outline of ${c.name}, in ${c.continent}. Its capital is ${c.capital}.`,
        countryId: c.id,
        active: true,
        source: SOURCE,
      });
    }

    // --- Good to know: language ---
    if (c.languages.length > 0 && allLanguages.length >= 4) {
      const correct = c.languages[0]!;
      const distractors = valueDistractors(
        correct,
        allLanguages,
        new Set(c.languages),
        3,
        `gtk-lang-d-${c.id}`
      );
      if (distractors.length === 3) {
        const options = seededShuffle([correct, ...distractors], `gtk-lang-${c.id}`);
        const spoken = c.languages.join(', ');
        questions.push({
          id: `good-to-know-language-${c.id}`,
          type: 'good-to-know',
          difficulty: 'medium',
          ageBands: ageBands('medium'),
          topic: 'facts',
          prompt: `Which language do people speak in ${c.name}?`,
          options,
          correctAnswer: correct,
          explanation: `In ${c.name}, people speak ${spoken}.`,
          countryId: c.id,
          active: true,
          source: SOURCE,
        });
      }
    }

    // --- Good to know: currency (money) ---
    if (c.currency && allCurrencies.length >= 4) {
      const correct = c.currency.name;
      const distractors = valueDistractors(
        correct,
        allCurrencies,
        new Set([correct]),
        3,
        `gtk-cur-d-${c.id}`
      );
      if (distractors.length === 3) {
        const options = seededShuffle([correct, ...distractors], `gtk-cur-${c.id}`);
        const symbol = c.currency.symbol ? ` (${c.currency.symbol})` : '';
        questions.push({
          id: `good-to-know-currency-${c.id}`,
          type: 'good-to-know',
          difficulty: 'medium',
          ageBands: ageBands('medium'),
          topic: 'facts',
          prompt: `What money do people use in ${c.name}?`,
          options,
          correctAnswer: correct,
          explanation: `${c.name} uses the ${correct}${symbol}.`,
          countryId: c.id,
          active: true,
          source: SOURCE,
        });
      }
    }

    // --- Good to know: dialing (calling) code ---
    if (c.callingCode && allCallingCodes.length >= 4) {
      const correct = c.callingCode;
      const distractors = valueDistractors(
        correct,
        allCallingCodes,
        new Set([correct]),
        3,
        `gtk-call-d-${c.id}`
      );
      if (distractors.length === 3) {
        const options = seededShuffle([correct, ...distractors], `gtk-call-${c.id}`);
        questions.push({
          id: `good-to-know-calling-${c.id}`,
          type: 'good-to-know',
          difficulty: 'hard',
          ageBands: ageBands('hard'),
          topic: 'facts',
          prompt: `What is the phone dialing code for ${c.name}?`,
          options,
          correctAnswer: correct,
          explanation: `To phone ${c.name}, you dial ${correct}.`,
          countryId: c.id,
          active: true,
          source: SOURCE,
        });
      }
    }

    // --- Good to know: internet top-level domain ---
    if (c.tld && allTlds.length >= 4) {
      const correct = c.tld;
      const distractors = valueDistractors(
        correct,
        allTlds,
        new Set([correct]),
        3,
        `gtk-tld-d-${c.id}`
      );
      if (distractors.length === 3) {
        const options = seededShuffle([correct, ...distractors], `gtk-tld-${c.id}`);
        questions.push({
          id: `good-to-know-tld-${c.id}`,
          type: 'good-to-know',
          difficulty: 'hard',
          ageBands: ageBands('hard'),
          topic: 'facts',
          prompt: `Which internet address ending belongs to ${c.name}?`,
          options,
          correctAnswer: correct,
          explanation: `Websites from ${c.name} can end in ${correct}.`,
          countryId: c.id,
          active: true,
          source: SOURCE,
        });
      }
    }

    // --- Reasoning (THINK pillar): odd-one-out and two-truths-and-a-lie ---
    const odd = makeOddOneOut(c, countries, index);
    if (odd) questions.push(odd);
    const lie = makeFindTheLie(c, countries, byId, index);
    if (lie) questions.push(lie);

    // --- Distance (LOCATE pillar): closest country ---
    const closest = makeClosest(c, countries);
    if (closest) questions.push(closest);

    // --- Borders (LOCATE pillar): pick every neighbour (multi-select) ---
    const border = makeBorderBattle(c, countries, byId, index);
    if (border) questions.push(border);

    // --- Reasoning (THINK pillar): what do these three share? ---
    const common = makeInCommon(
      c,
      countries,
      allContinents,
      allCurrencies,
      allLanguages,
      langFreq,
      index
    );
    if (common) questions.push(common);
  });

  // --- Flag Builder: order the colour bands (only for templated flags) ---
  for (const template of templates) {
    const c = byId.get(template.countryId);
    if (!c) continue;
    const correct = template.stripes.join('-');
    const wrong = new Set<string>();
    // Deterministic wrong arrangements: reversed and rotations.
    const rev = [...template.stripes].reverse().join('-');
    if (rev !== correct) wrong.add(rev);
    for (let i = 1; i < template.stripes.length && wrong.size < 3; i++) {
      const rot = [...template.stripes.slice(i), ...template.stripes.slice(0, i)].join('-');
      if (rot !== correct) wrong.add(rot);
    }
    // Fallback filler if a flag is too symmetric to produce 3 distinct wrongs.
    const fillers = ['red-white-blue', 'blue-white-red', 'green-white-red', 'black-red-gold'];
    for (const f of fillers) {
      if (wrong.size >= 3) break;
      if (f !== correct) wrong.add(f);
    }
    const options = seededShuffle([correct, ...[...wrong].slice(0, 3)], `build-${c.id}`);
    questions.push({
      id: `flag-builder-${c.id}`,
      type: 'flag-builder',
      difficulty: 'medium',
      ageBands: ageBands('medium'),
      topic: 'flags',
      prompt: `Put the colours in the right order to build the flag of ${c.name} (${template.orientation}).`,
      options,
      correctAnswer: correct,
      explanation: `${c.name}'s flag has ${template.orientation} bands: ${template.stripes.join(', ')}.`,
      countryId: c.id,
      active: true,
      source: SOURCE,
    });
  }

  return questions;
}
