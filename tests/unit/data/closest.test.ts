import { describe, expect, it } from 'vitest';
import { generateQuestions, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(id: string, name: string, latlng: [number, number]): Country {
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
    neighbours: [],
    facts: [],
    area: 100000,
    landlocked: false,
    languages: ['Testish'],
    latlng,
    active: true,
    source: 'test',
  };
}

// A little constellation: `home` at the origin, one very near, and several far away.
const countries: Country[] = [
  country('ho', 'Home', [0, 0]),
  country('nr', 'Near', [1, 1]),
  country('f1', 'Far1', [40, 40]),
  country('f2', 'Far2', [-50, 60]),
  country('f3', 'Far3', [30, -80]),
  country('f4', 'Far4', [-20, 120]),
  country('f5', 'Far5', [60, -10]),
  country('f6', 'Far6', [10, 150]),
  country('f7', 'Far7', [-35, -60]),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map(countries.map((c) => [c.id, { mapSize: 'medium' as const }])),
  templates: [],
};

const closest = generateQuestions(inputs).filter((q) => q.type === 'closest-country');

describe('closest-country', () => {
  it('picks the genuinely nearest option as the answer', () => {
    const home = closest.find((q) => q.id === 'closest-country-ho')!;
    expect(home.topic).toBe('location');
    expect(home.options).toHaveLength(4);
    expect(new Set(home.options).size).toBe(4);
    expect(home.correctAnswer).toBe('nr'); // "Near" is closest to "Home"
    expect(home.options).toContain('nr');
  });

  it('never offers the anchor or a direct neighbour', () => {
    const withNeighbour = generateQuestions({
      ...inputs,
      countries: countries.map((c) => (c.id === 'ho' ? { ...c, neighbours: ['nr'] } : c)),
    }).find((q) => q.id === 'closest-country-ho');
    // With "Near" now a neighbour, it must be excluded, so a further country wins.
    expect(withNeighbour?.options).not.toContain('nr');
    expect(withNeighbour?.correctAnswer).not.toBe('ho');
  });
});
