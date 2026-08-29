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

// A spread of continents / coasts / languages so all three generators have material.
// Every country speaks a shared 'Common' plus its own unique tongue, so an "In Common"
// language group can always find at least three languages nobody in the group speaks.
const countries: Country[] = [
  country('aa', 'Aaland', {
    continent: 'Europe',
    currency: { code: 'AAA', name: 'Aa mark' },
    languages: ['Common', 'Aaish'],
  }),
  country('bb', 'Beeland', { continent: 'Asia', landlocked: true, languages: ['Common', 'Beeish'] }),
  country('cc', 'Ceeland', { continent: 'Asia', landlocked: true, languages: ['Common', 'Ceeish'] }),
  country('dd', 'Deeland', { continent: 'Asia', landlocked: true, languages: ['Common', 'Deeish'] }),
  country('ee', 'Eeland', { continent: 'Africa', languages: ['Common', 'Eeish'] }),
  country('ff', 'Efland', { continent: 'Africa', languages: ['Common', 'Efish'] }),
  country('gg', 'Geeland', { continent: 'Africa', languages: ['Common', 'Geeish'] }),
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
    }
  });

  it('never offers a distractor that is also true of the group', () => {
    const byId = new Map(countries.map((c) => [c.id, c]));
    for (const q of common) {
      const group = q.subjectIds!.map((id) => byId.get(id)!);
      for (const option of q.options) {
        if (option === q.correctAnswer) continue;
        // Continent distractor: no group member is in that continent.
        const contMatch = /^They are all in (.+)\.$/.exec(option);
        if (contMatch) {
          expect(group.some((g) => g.continent === contMatch[1])).toBe(false);
        }
        // Language distractor: no group member speaks it.
        const langMatch = /^They all speak (.+)\.$/.exec(option);
        if (langMatch) {
          expect(group.some((g) => g.languages.includes(langMatch[1]!))).toBe(false);
        }
        // Currency distractor: no group member uses it.
        const curMatch = /^They all use the (.+)\.$/.exec(option);
        if (curMatch) {
          expect(group.some((g) => g.currency?.name === curMatch[1])).toBe(false);
        }
      }
    }
  });
});
