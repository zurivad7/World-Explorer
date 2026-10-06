import { describe, expect, it } from 'vitest';
import {
  buildCapitalResolver,
  capitalFirstLetter,
  capitalsForLetter,
  judgeCapitalGuess,
  pickLetter,
  playableLetters,
} from '@/features/games/speedrun/capitalLetters';
import type { Country } from '@/types';

function country(id: string, name: string, capital: string): Country {
  return {
    id,
    iso2: id,
    iso3: id.toUpperCase(),
    name,
    capital,
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

// Six capitals starting with B (so B clears MIN_FOR_LETTER=6), plus a few others.
const fixture: Country[] = [
  country('be', 'Belgium', 'Brussels'),
  country('ar', 'Argentina', 'Buenos Aires'),
  country('az', 'Azerbaijan', 'Baku'),
  country('bb', 'Barbados', 'Bridgetown'),
  country('bz', 'Belize', 'Belmopan'),
  country('rs', 'Serbia', 'Belgrade'),
  country('fr', 'France', 'Paris'),
  country('us', 'United States', 'Washington, D.C.'),
  country('ag', 'Antigua and Barbuda', "Saint John's"),
];

describe('capitalFirstLetter', () => {
  it('takes the first a–z letter, ignoring case/accents/punctuation', () => {
    expect(capitalFirstLetter(country('x', 'X', 'Brussels'))).toBe('b');
    expect(capitalFirstLetter(country('x', 'X', 'Washington, D.C.'))).toBe('w');
    expect(capitalFirstLetter(country('x', 'X', "N'Djamena"))).toBe('n');
  });
});

describe('playableLetters', () => {
  it('offers only letters with enough capitals (drops the thin ones)', () => {
    // Only B has >= 6 capitals in the fixture; P and W have one each.
    expect(playableLetters(fixture)).toEqual(['b']);
  });

  it('pickLetter always returns a playable letter and is deterministic', () => {
    const playable = playableLetters(fixture);
    for (let i = 0; i < 12; i++) expect(playable).toContain(pickLetter(`seed-${i}`, fixture));
    expect(pickLetter('abc', fixture)).toBe(pickLetter('abc', fixture));
  });
});

describe('capitalsForLetter', () => {
  it('returns the full answer set for a letter', () => {
    const b = capitalsForLetter('b', fixture).map((c) => c.id).sort();
    expect(b).toEqual(['ar', 'az', 'bb', 'be', 'bz', 'rs']); // all six B-capitals
  });
});

describe('buildCapitalResolver', () => {
  const resolver = buildCapitalResolver(fixture);
  it('resolves a plain capital name', () => {
    expect(resolver.resolve('Brussels')?.id).toBe('be');
    expect(resolver.resolve('  buenos aires ')?.id).toBe('ar');
  });
  it('resolves the part before a comma', () => {
    expect(resolver.resolve('Washington')?.id).toBe('us'); // "Washington, D.C."
  });
  it('resolves saint/st spelling variants', () => {
    expect(resolver.resolve("St John's")?.id).toBe('ag'); // stored as "Saint John's"
  });
  it('returns undefined for a non-capital', () => {
    expect(resolver.resolve('Gotham')).toBeUndefined();
  });
});

describe('judgeCapitalGuess', () => {
  const resolver = buildCapitalResolver(fixture);
  it('accepts a valid, new capital for the letter', () => {
    expect(judgeCapitalGuess('Brussels', 'b', new Set(), resolver).status).toBe('correct');
  });
  it('rejects a repeat', () => {
    expect(judgeCapitalGuess('brussels', 'b', new Set(['be']), resolver).status).toBe('duplicate');
  });
  it('rejects a real capital that does not start with the letter', () => {
    expect(judgeCapitalGuess('Paris', 'b', new Set(), resolver).status).toBe('wrong-letter');
  });
  it('rejects an unknown word', () => {
    expect(judgeCapitalGuess('Gotham', 'b', new Set(), resolver).status).toBe('unknown');
  });
});
