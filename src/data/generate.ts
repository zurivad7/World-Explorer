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

export function generateQuestions(inputs: GeneratorInputs): Question[] {
  const { countries, hints, templates } = inputs;
  const questions: Question[] = [];
  const byId = new Map(countries.map((c) => [c.id, c]));

  // Value pools for "good to know" fact questions (distractors are drawn from
  // real values other countries have, so wrong options still look plausible).
  const uniq = (values: string[]): string[] => [...new Set(values)].sort();
  const allLanguages = uniq(countries.flatMap((c) => c.languages));
  const allCurrencies = uniq(countries.map((c) => c.currency?.name ?? '').filter(Boolean));
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
      const distractors = pickDistractors(c, countries, 3, index + 2);
      const options = seededShuffle(
        [c.capital, ...distractors.map((d) => d.capital)],
        `cap-c-${c.id}`
      );
      questions.push({
        id: `capital-challenge-capital-${c.id}`,
        type: 'capital-challenge',
        difficulty,
        ageBands: ageBands(difficulty),
        topic: 'capitals',
        prompt: `What is the capital of ${c.name}?`,
        options,
        correctAnswer: c.capital,
        explanation: `The capital of ${c.name} is ${c.capital}.`,
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
