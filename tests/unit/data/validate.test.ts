import { describe, expect, it } from 'vitest';
import { achievements, countries } from '@/data';
import { questions } from '@/data/questions';
import {
  MVP_GAME_MODES,
  MVP_MIN_COUNTRIES,
  MVP_MIN_QUESTIONS_PER_MODE,
  validateCompleteness,
  validateContent,
} from '@/data/validate';
import type { Country, Question } from '@/types';

describe('shipped content — structural', () => {
  it('has no errors', () => {
    const { errors } = validateContent({ countries, questions, achievements });
    expect(errors).toEqual([]);
  });
});

describe('shipped content — MVP completeness (PRD §24)', () => {
  it('meets every completeness gate', () => {
    const { errors } = validateCompleteness({ countries, questions, achievements });
    expect(errors).toEqual([]);
  });

  it(`ships at least ${MVP_MIN_COUNTRIES} countries across all inhabited continents`, () => {
    expect(countries.length).toBeGreaterThanOrEqual(MVP_MIN_COUNTRIES);
    const continents = new Set(countries.map((c) => c.continent));
    for (const cont of ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania']) {
      expect(continents).toContain(cont);
    }
  });

  it(`ships at least ${MVP_MIN_QUESTIONS_PER_MODE} questions for every game mode`, () => {
    for (const mode of MVP_GAME_MODES) {
      const count = questions.filter((q) => q.type === mode).length;
      expect(count).toBeGreaterThanOrEqual(MVP_MIN_QUESTIONS_PER_MODE);
    }
  });

  it('gives every country a flag, capital and geometry id', () => {
    for (const c of countries) {
      expect(c.flagAsset).toBeTruthy();
      expect(c.capital).toBeTruthy();
      expect(c.geometryId).toBeTruthy();
    }
  });
});

describe('validateContent — catches problems', () => {
  const goodCountry: Country = countries[0]!;

  it('flags a question whose correctAnswer is not an option', () => {
    const bad: Question = {
      ...questions[0]!,
      id: 'bad-q',
      options: ['a', 'b'],
      correctAnswer: 'c',
    };
    const { errors } = validateContent({
      countries,
      questions: [bad],
      achievements,
    });
    expect(errors.some((e) => e.includes('not one of its options'))).toBe(true);
  });

  it('flags duplicate country ids', () => {
    const { errors } = validateContent({
      countries: [goodCountry, goodCountry],
      questions: [],
      achievements,
    });
    expect(errors.some((e) => e.includes('duplicate country id'))).toBe(true);
  });

  it('flags a question referencing an unknown country', () => {
    const bad: Question = { ...questions[0]!, id: 'orphan-q', countryId: 'zz' };
    const { errors } = validateContent({ countries, questions: [bad], achievements });
    expect(errors.some((e) => e.includes('unknown country'))).toBe(true);
  });

  it('flags a country referencing an unknown neighbour', () => {
    const bad: Country = { ...goodCountry, id: 'xx', iso2: 'xx', neighbours: ['zz'] };
    const { errors } = validateContent({
      countries: [...countries, bad],
      questions: [],
      achievements,
    });
    expect(errors.some((e) => e.includes('unknown neighbour'))).toBe(true);
  });
});
