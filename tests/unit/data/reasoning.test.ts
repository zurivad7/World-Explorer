import { describe, expect, it } from 'vitest';
import { generateQuestions, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(id: string, name: string, extra: Partial<Country> = {}): Country {
  return {
    id,
    iso2: id,
    iso3: id.toUpperCase(),
    name,
    capital: `${name}ville`,
    continent: 'Europe',
    region: 'Test',
    flagAsset: `/assets/flags/${id}.svg`,
    geometryId: id,
    neighbours: [],
    facts: [],
    area: 100000,
    landlocked: false,
    languages: ['Testish'],
    active: true,
    source: 'test',
    ...extra,
  };
}

// A spread of continents / coasts / languages / positions so all three generators have
// material. Every country speaks a shared 'Common' plus its own unique tongue, so an
// "In Common" language group can always find languages nobody in the group speaks, and
// the latlng points span both hemispheres and the tropics for the position traits.
const countries: Country[] = [
  country('aa', 'Aaland', {
    continent: 'Europe',
    currency: { code: 'AAA', name: 'Aa mark' },
    languages: ['Common', 'Aaish'],
    latlng: [50, 10],
  }),
  country('bb', 'Beeland', {
    continent: 'Asia',
    landlocked: true,
    languages: ['Common', 'Beeish'],
    latlng: [40, 100],
  }),
  country('cc', 'Ceeland', {
    continent: 'Asia',
    landlocked: true,
    languages: ['Common', 'Ceeish'],
    latlng: [45, 90],
  }),
  country('dd', 'Deeland', {
    continent: 'Asia',
    landlocked: true,
    languages: ['Common', 'Deeish'],
    latlng: [10, 80],
  }),
  country('ee', 'Eeland', { continent: 'Africa', languages: ['Common', 'Eeish'], latlng: [-10, 20] }),
  country('ff', 'Efland', { continent: 'Africa', languages: ['Common', 'Efish'], latlng: [-15, -25] }),
  country('gg', 'Geeland', { continent: 'Africa', languages: ['Common', 'Geeish'], latlng: [-5, 30] }),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map(countries.map((c) => [c.id, { mapSize: 'medium' as const }])),
  templates: [],
};

const questions = generateQuestions(inputs);

describe('find-the-lie', () => {
  const lies = questions.filter((q) => q.type === 'find-the-lie');

  it('makes one per country with a true/false trio', () => {
    expect(lies.length).toBe(countries.length);
    for (const q of lies) {
      expect(q.topic).toBe('reasoning');
      expect(q.options).toHaveLength(3);
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(3);
      expect(q.explanation.length).toBeGreaterThan(0);
    }
  });

  it('never puts the lie in the same category as a shown truth (no two capital lines)', () => {
    for (const q of lies) {
      const capitalLines = q.options.filter((o) => /capital city is/.test(o));
      expect(capitalLines.length).toBeLessThanOrEqual(1);
    }
  });
});

describe('odd-one-out', () => {
  const odd = questions.filter((q) => q.type === 'odd-one-out');

  it('offers four countries with the intended answer explained', () => {
    expect(odd.length).toBeGreaterThan(0);
    for (const q of odd) {
      expect(q.topic).toBe('reasoning');
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(4);
      expect(q.explanation).toMatch(/but .+\./);
    }
  });

  it('marks the iterated country as the odd one', () => {
    const bb = odd.find((q) => q.id === 'odd-one-out-ee');
    // Eeland (Africa) is odd against three Asian landlocked... actually its own group;
    // just assert the correct answer is the country the question is about.
    if (bb) expect(bb.correctAnswer).toBe('ee');
  });
});

describe('in-common', () => {
  const common = questions.filter((q) => q.type === 'in-common');
  const byId = new Map(countries.map((c) => [c.id, c]));

  // Evaluate any generated statement against a group: true / false / unknown (null).
  // Mirrors the phrasings the generator emits, so the test fails if a phrasing drifts
  // out of sync rather than silently passing an unchecked option.
  function statementTrue(opt: string, group: Country[]): boolean | null {
    let m: RegExpExecArray | null;
    if (/east of the Prime Meridian/.test(opt))
      return group.every((g) => g.latlng && g.latlng[1] >= 0);
    if (/west of the Prime Meridian/.test(opt))
      return group.every((g) => g.latlng && g.latlng[1] < 0);
    if (/north of the equator/.test(opt)) return group.every((g) => g.latlng && g.latlng[0] >= 0);
    if (/south of the equator/.test(opt)) return group.every((g) => g.latlng && g.latlng[0] < 0);
    if (/tropics/.test(opt)) return group.every((g) => g.latlng && Math.abs(g.latlng[0]) <= 23.5);
    if (/landlocked/.test(opt)) return group.every((g) => g.landlocked);
    if (/sea coast/.test(opt)) return group.every((g) => !g.landlocked);
    if ((m = /^They are all in (.+)\.$/.exec(opt)))
      return group.every((g) => g.continent === m![1]);
    if ((m = /^They all use the (.+)\.$/.exec(opt)))
      return group.every((g) => g.currency?.name === m![1]);
    if ((m = /^They all speak (.+)\.$/.exec(opt)))
      return group.every((g) => g.languages.includes(m![1]!));
    return null;
  }

  it('shows three subject countries and exactly one true option', () => {
    expect(common.length).toBeGreaterThan(0);
    for (const q of common) {
      expect(q.topic).toBe('reasoning');
      expect(q.subjectIds).toBeDefined();
      expect(q.subjectIds).toHaveLength(3);
      expect(new Set(q.subjectIds).size).toBe(3);
      // The iterated country is always one of the three subjects.
      expect(q.subjectIds).toContain(q.countryId);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.correctAnswer);

      // Every option must be recognised, and exactly one — the correct answer — true.
      const group = q.subjectIds!.map((id) => byId.get(id)!);
      const verdicts = q.options.map((o) => statementTrue(o, group));
      expect(verdicts).not.toContain(null); // no phrasing the test can't check
      const trueOnes = q.options.filter((o) => statementTrue(o, group) === true);
      expect(trueOnes).toEqual([q.correctAnswer]);
    }
  });

  it('varies the shared trait beyond a single category', () => {
    // Across the fixture the questions should not all lead with the same kind of trait.
    const kinds = new Set(
      common.map((q) => {
        if (/equator|Prime Meridian|tropics/.test(q.correctAnswer)) return 'position';
        if (/speak/.test(q.correctAnswer)) return 'language';
        if (/use the/.test(q.correctAnswer)) return 'currency';
        if (/landlocked|sea coast/.test(q.correctAnswer)) return 'coast';
        return 'continent';
      })
    );
    expect(kinds.size).toBeGreaterThan(1);
  });
});
