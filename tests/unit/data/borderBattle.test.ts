import { describe, expect, it } from 'vitest';
import { generateQuestions, encodeSelection, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(id: string, name: string, neighbours: string[]): Country {
  return {
    id,
    iso2: id,
    iso3: id.toUpperCase(),
    name,
    capital: `${name} City`,
    continent: 'Europe',
    region: 'Test',
    flagAsset: `/assets/flags/${id}.svg`,
    geometryId: id,
    neighbours,
    facts: [],
    area: 100000,
    landlocked: false,
    languages: ['Testish'],
    active: true,
    source: 'test',
  };
}

// `home` borders three of the others; there are enough non-neighbours to fill options.
const countries: Country[] = [
  country('ho', 'Home', ['n1', 'n2', 'n3']),
  country('n1', 'Neigh1', ['ho']),
  country('n2', 'Neigh2', ['ho']),
  country('n3', 'Neigh3', ['ho']),
  country('x1', 'Far1', []),
  country('x2', 'Far2', []),
  country('x3', 'Far3', []),
  country('x4', 'Far4', []),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map(countries.map((c) => [c.id, { mapSize: 'medium' as const }])),
  templates: [],
};

const battles = generateQuestions(inputs).filter((q) => q.type === 'border-battle');

describe('encodeSelection', () => {
  it('is order-independent (sorted, joined)', () => {
    expect(encodeSelection(['n2', 'n1', 'n3'])).toBe('n1+n2+n3');
    expect(encodeSelection(['n3', 'n1'])).toBe(encodeSelection(['n1', 'n3']));
    expect(encodeSelection([])).toBe('');
  });
});

describe('border-battle', () => {
  it('only makes a question for countries with at least one neighbour', () => {
    const ids = battles.map((q) => q.countryId);
    expect(ids).toContain('ho');
    // Islands with no neighbours get no border question.
    expect(ids).not.toContain('x1');
  });

  it('offers five options, always with a non-neighbour, and the neighbour set is the answer', () => {
    const home = battles.find((q) => q.countryId === 'ho')!;
    expect(home.topic).toBe('location');
    expect(home.options).toHaveLength(5);
    const neighbourSet = new Set(['n1', 'n2', 'n3']);
    const neighboursInOptions = home.options.filter((o) => neighbourSet.has(o));
    const nonNeighbours = home.options.filter((o) => !neighbourSet.has(o));
    expect(neighboursInOptions.length).toBeGreaterThan(0);
    expect(nonNeighbours.length).toBeGreaterThan(0); // a real "select all that apply"
    // The correct answer is exactly the canonical set of the neighbour options.
    expect(home.correctAnswer).toBe(encodeSelection(neighboursInOptions));
    // Never lists a non-neighbour as correct.
    for (const id of home.correctAnswer.split('+')) {
      expect(neighbourSet.has(id)).toBe(true);
      expect(home.options).toContain(id);
    }
  });
});
