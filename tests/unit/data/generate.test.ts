import { describe, expect, it } from 'vitest';
import { generateQuestions, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(partial: Partial<Country> & Pick<Country, 'id' | 'name' | 'capital' | 'continent'>): Country {
  return {
    iso2: partial.id,
    iso3: partial.id.toUpperCase(),
    region: 'Test Region',
    flagAsset: `/assets/flags/${partial.id}.svg`,
    geometryId: partial.id,
    neighbours: [],
    facts: [{ text: 'A fact.' }],
    area: 1000,
    landlocked: false,
    languages: ['Testish'],
    active: true,
    source: 'test',
    ...partial,
  };
}

const countries: Country[] = [
  country({ id: 'fr', name: 'France', capital: 'Paris', continent: 'Europe', neighbours: ['de'] }),
  country({ id: 'de', name: 'Germany', capital: 'Berlin', continent: 'Europe', neighbours: ['fr'] }),
  country({ id: 'br', name: 'Brazil', capital: 'Brasília', continent: 'South America' }),
  country({ id: 'jp', name: 'Japan', capital: 'Tokyo', continent: 'Asia' }),
  country({ id: 'eg', name: 'Egypt', capital: 'Cairo', continent: 'Africa' }),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map([
    ['fr', { mapSize: 'medium' }],
    ['de', { mapSize: 'medium' }],
    ['br', { mapSize: 'large' }],
    ['jp', { mapSize: 'medium', similarFlag: true }],
    ['eg', { mapSize: 'large' }],
  ]),
  templates: [{ countryId: 'fr', orientation: 'vertical', stripes: ['blue', 'white', 'red'] }],
};

describe('generateQuestions', () => {
  const questions = generateQuestions(inputs);

  it('is deterministic', () => {
    expect(generateQuestions(inputs)).toEqual(questions);
  });

  it('gives every question a unique id', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("always includes the correct answer among a question's options", () => {
    for (const q of questions) {
      expect(q.options).toContain(q.correctAnswer);
    }
  });

  it('produces options with no duplicates', () => {
    for (const q of questions) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('marks similar-flag countries as harder flag questions', () => {
    const jpFlag = questions.find((q) => q.id === 'flag-detective-flag-jp');
    expect(jpFlag?.difficulty).toBe('hard');
  });

  it('uses a real neighbour as a clue when available', () => {
    const frClue = questions.find((q) => q.id === 'geography-detective-fr');
    expect(frClue?.prompt).toContain('Germany');
  });

  it('builds a flag-builder question only for templated flags', () => {
    const builder = questions.filter((q) => q.type === 'flag-builder');
    expect(builder).toHaveLength(1);
    expect(builder[0]?.correctAnswer).toBe('blue-white-red');
  });
});
