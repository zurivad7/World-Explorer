import { describe, expect, it } from 'vitest';
import { generateQuestions, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(partial: Partial<Country> & Pick<Country, 'id' | 'name' | 'capital'>): Country {
  return {
    iso2: partial.id,
    iso3: partial.id.toUpperCase(),
    continent: 'Africa',
    region: 'Test',
    flagAsset: `/assets/flags/${partial.id}.svg`,
    geometryId: partial.id,
    neighbours: [],
    facts: [],
    area: 1000,
    landlocked: false,
    languages: ['Testish'],
    active: true,
    source: 'test',
    ...partial,
  };
}

const countries: Country[] = [
  country({
    id: 'ng',
    name: 'Nigeria',
    capital: 'Abuja',
    capitalNote: 'Abuja replaced Lagos as the capital in 1991.',
  }),
  country({ id: 'ke', name: 'Kenya', capital: 'Nairobi' }),
  country({ id: 'gh', name: 'Ghana', capital: 'Accra' }),
  country({ id: 'eg', name: 'Egypt', capital: 'Cairo' }),
  country({ id: 'za', name: 'South Africa', capital: 'Pretoria' }),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map(countries.map((c) => [c.id, { mapSize: 'medium' as const }])),
  templates: [],
  trickyCapitals: new Map([['ng', ['Lagos']]]),
};

const questions = generateQuestions(inputs);
const nigeriaCapital = questions.find((q) => q.id === 'capital-challenge-capital-ng')!;

describe('capital quiz with tricky cities', () => {
  it('offers the mistaken city as a distractor next to the real capital', () => {
    expect(nigeriaCapital.correctAnswer).toBe('Abuja');
    expect(nigeriaCapital.options).toContain('Lagos');
    expect(nigeriaCapital.options).toContain('Abuja');
  });

  it('keeps four distinct options', () => {
    expect(nigeriaCapital.options).toHaveLength(4);
    expect(new Set(nigeriaCapital.options).size).toBe(4);
  });

  it('adds the authored capital note to the explanation', () => {
    expect(nigeriaCapital.explanation).toContain('Abuja replaced Lagos');
  });

  it('never drops a trap that accidentally equals the real capital', () => {
    // A trap equal to the capital must be ignored (no duplicate option).
    const q = generateQuestions({
      ...inputs,
      trickyCapitals: new Map([['ng', ['Abuja', 'Lagos']]]),
    }).find((x) => x.id === 'capital-challenge-capital-ng')!;
    expect(q.options.filter((o) => o === 'Abuja')).toHaveLength(1);
    expect(q.options).toContain('Lagos');
  });
});
