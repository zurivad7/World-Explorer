import { describe, expect, it } from 'vitest';
import {
  buildResolver,
  countriesForLength,
  countryLetterCount,
  isSingleWord,
  judgeLengthGuess,
  pickLength,
  playableLengths,
} from '@/features/games/speedrun/letterCount';
import type { Country } from '@/types';

function country(id: string, name: string): Country {
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
    active: true,
    source: 'test',
  };
}

// Six 5-letter one-word names (so 5 clears MIN_FOR_LENGTH=6), plus assorted others.
const fixture: Country[] = [
  country('in', 'India'), // 5
  country('cn', 'China'), // 5
  country('ne', 'Niger'), // 5
  country('es', 'Spain'), // 5
  country('eg', 'Egypt'), // 5
  country('jp', 'Japan'), // 5
  country('br', 'Brazil'), // 6
  country('ng', 'Nigeria'), // 7
  country('us', 'United States'), // multi-word (not answerable)
  country('kr', 'South Korea'), // multi-word (10 ascii letters, still excluded)
];

describe('isSingleWord', () => {
  it('is true only for names with no spaces or hyphens', () => {
    expect(isSingleWord(country('in', 'India'))).toBe(true);
    expect(isSingleWord(country('us', 'United States'))).toBe(false);
    expect(isSingleWord(country('tl', 'Timor-Leste'))).toBe(false);
  });
});

describe('countryLetterCount', () => {
  it('counts ascii letters (accents/punctuation stripped)', () => {
    expect(countryLetterCount(country('in', 'India'))).toBe(5);
    expect(countryLetterCount(country('ng', 'Nigeria'))).toBe(7);
  });
});

describe('playableLengths', () => {
  it('offers only lengths with enough one-word countries', () => {
    // Only 5 has >= 6 one-word countries in the fixture; 6 and 7 have one each.
    expect(playableLengths(fixture)).toEqual([5]);
  });

  it('pickLength always returns a playable length and is deterministic', () => {
    const playable = playableLengths(fixture);
    for (let i = 0; i < 12; i++) {
      expect(playable).toContain(pickLength(`seed-${i}`, fixture));
    }
    expect(pickLength('abc', fixture)).toBe(pickLength('abc', fixture));
  });
});

describe('countriesForLength', () => {
  it('returns the one-word answer set for a length', () => {
    const five = countriesForLength(5, fixture).map((c) => c.id).sort();
    expect(five).toEqual(['cn', 'eg', 'es', 'in', 'jp', 'ne']);
  });

  it('never includes multi-word names, even at a matching ascii length', () => {
    // "South Korea" is 10 ascii letters but must never be an answer.
    expect(countriesForLength(10, fixture)).toEqual([]);
  });
});

describe('judgeLengthGuess', () => {
  const resolver = buildResolver(fixture);

  it('accepts a valid, new one-word country of the right length', () => {
    expect(judgeLengthGuess('India', 5, new Set(), resolver).status).toBe('correct');
  });

  it('rejects a repeat', () => {
    expect(judgeLengthGuess('india', 5, new Set(['in']), resolver).status).toBe('duplicate');
  });

  it('rejects a real one-word country of the wrong length', () => {
    const r = judgeLengthGuess('Brazil', 5, new Set(), resolver); // 6 letters
    expect(r).toMatchObject({ status: 'wrong-length', reason: 'length' });
  });

  it('rejects a multi-word country even at a matching length', () => {
    const r = judgeLengthGuess('South Korea', 10, new Set(), resolver);
    expect(r).toMatchObject({ status: 'wrong-length', reason: 'multi-word' });
  });

  it('rejects an unknown word', () => {
    expect(judgeLengthGuess('Wakanda', 5, new Set(), resolver).status).toBe('unknown');
  });
});
