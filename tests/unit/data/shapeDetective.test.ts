import { describe, expect, it } from 'vitest';
import { generateQuestions, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(id: string, name: string): Country {
  return {
    id,
    iso2: id,
    iso3: id.toUpperCase(),
    name,
    capital: `${name} City`,
    continent: 'Africa',
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
  };
}

const countries = [
  country('ng', 'Nigeria'),
  country('ke', 'Kenya'),
  country('gh', 'Ghana'),
  country('eg', 'Egypt'),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map(countries.map((c) => [c.id, { mapSize: 'medium' as const }])),
  templates: [],
  shapeCountryIds: new Set(['ng', 'ke', 'gh']), // eg deliberately has no silhouette
};

const questions = generateQuestions(inputs);
const shape = questions.filter((q) => q.type === 'shape-detective');

describe('shape-detective questions', () => {
  it('creates one only for countries that have a silhouette', () => {
    expect(shape.map((q) => q.countryId).sort()).toEqual(['gh', 'ke', 'ng']);
    expect(shape.some((q) => q.countryId === 'eg')).toBe(false);
  });

  it('uses the shapes topic and includes the correct answer among options', () => {
    for (const q of shape) {
      expect(q.topic).toBe('shapes');
      expect(q.correctAnswer).toBe(q.countryId);
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('does not reveal the country name in the prompt', () => {
    const ng = shape.find((q) => q.countryId === 'ng')!;
    expect(ng.prompt).toBe('Which country has this shape?');
    expect(ng.prompt).not.toContain('Nigeria');
  });
});
