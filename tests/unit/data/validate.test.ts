import { describe, expect, it } from 'vitest';
import { achievements, countries, questions } from '@/data';
import { validateContent } from '@/data/validate';
import type { Country, Question } from '@/types';

describe('validateContent — shipped seed content', () => {
  it('has no errors', () => {
    const { errors } = validateContent({ countries, questions, achievements });
    expect(errors).toEqual([]);
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
