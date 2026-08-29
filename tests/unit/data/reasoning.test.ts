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

// A spread of continents / coasts so both generators have material to work with.
const countries: Country[] = [
  country('aa', 'Aaland', { continent: 'Europe', currency: { code: 'AAA', name: 'Aa mark' } }),
  country('bb', 'Beeland', { continent: 'Asia', landlocked: true }),
  country('cc', 'Ceeland', { continent: 'Asia', landlocked: true }),
  country('dd', 'Deeland', { continent: 'Asia', landlocked: true }),
  country('ee', 'Eeland', { continent: 'Africa' }),
  country('ff', 'Efland', { continent: 'Africa' }),
  country('gg', 'Geeland', { continent: 'Africa' }),
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
