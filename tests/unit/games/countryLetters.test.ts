import { describe, expect, it } from 'vitest';
import {
  buildResolver,
  countriesForLetter,
  judgeGuess,
  matchesRule,
  nameLetters,
  pickLetter,
  playableLetters,
} from '@/features/games/speedrun/countryLetters';
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

const fixture: Country[] = [
  country('br', 'Brazil'),
  country('be', 'Belgium'),
  country('zm', 'Zambia'),
  country('zw', 'Zimbabwe'),
  country('us', 'United States'),
  country('lc', 'Saint Lucia'),
  country('ag', 'Antigua and Barbuda'),
  country('fr', 'France'),
];

describe('nameLetters', () => {
  it('reduces a name to ascii letters only', () => {
    expect(nameLetters('Antigua and Barbuda')).toBe('antiguaandbarbuda');
    expect(nameLetters('São Tomé')).toBe('saotome');
    expect(nameLetters('Timor-Leste')).toBe('timorleste');
  });
});

describe('matchesRule', () => {
  it('checks the first letter for "starts"', () => {
    expect(matchesRule(country('br', 'Brazil'), 'b', 'starts')).toBe(true);
    expect(matchesRule(country('br', 'Brazil'), 'z', 'starts')).toBe(false);
  });
  it('checks anywhere for "contains"', () => {
    expect(matchesRule(country('br', 'Brazil'), 'z', 'contains')).toBe(true);
    expect(matchesRule(country('be', 'Belgium'), 'z', 'contains')).toBe(false);
  });
});

describe('playableLetters', () => {
  it('offers only letters with enough starting countries (drops singletons and empties)', () => {
    // In the fixture only B and Z have >= 2 countries starting with them.
    expect(playableLetters('starts', fixture)).toEqual(['b', 'z']);
  });

  it('pickLetter always returns one of the playable letters', () => {
    const playable = playableLetters('starts', fixture);
    for (let i = 0; i < 12; i++) {
      const chosen = pickLetter('starts', `seed-${i}`, fixture);
      expect(playable).toContain(chosen);
    }
  });

  it('is deterministic for a seed', () => {
    expect(pickLetter('starts', 'abc', fixture)).toBe(pickLetter('starts', 'abc', fixture));
  });
});

describe('countriesForLetter', () => {
  it('returns the full answer set for a letter + rule', () => {
    const b = countriesForLetter('b', 'starts', fixture).map((c) => c.id).sort();
    expect(b).toEqual(['be', 'br']);
    const z = countriesForLetter('z', 'contains', fixture).map((c) => c.id).sort();
    expect(z).toEqual(['br', 'zm', 'zw']); // Brazil contains a z too
  });
});

describe('buildResolver', () => {
  const resolver = buildResolver(fixture);
  it('resolves the canonical name', () => {
    expect(resolver.resolve('Brazil')?.id).toBe('br');
    expect(resolver.resolve('  brazil ')?.id).toBe('br');
  });
  it('resolves aliases and spelling variants', () => {
    expect(resolver.resolve('USA')?.id).toBe('us');
    expect(resolver.resolve('St Lucia')?.id).toBe('lc'); // saint → st
    expect(resolver.resolve('Antigua & Barbuda')?.id).toBe('ag'); // "and" dropped
  });
  it('returns undefined for a non-country', () => {
    expect(resolver.resolve('Wakanda')).toBeUndefined();
  });
});

describe('judgeGuess', () => {
  const resolver = buildResolver(fixture);
  it('accepts a valid, new country for the letter', () => {
    const r = judgeGuess('Brazil', 'b', 'starts', new Set(), resolver);
    expect(r.status).toBe('correct');
  });
  it('rejects a repeat', () => {
    const r = judgeGuess('brazil', 'b', 'starts', new Set(['br']), resolver);
    expect(r.status).toBe('duplicate');
  });
  it('rejects a real country that does not fit the letter', () => {
    const r = judgeGuess('Belgium', 'z', 'starts', new Set(), resolver);
    expect(r.status).toBe('wrong-letter');
  });
  it('rejects an unknown word', () => {
    expect(judgeGuess('Wakanda', 'b', 'starts', new Set(), resolver).status).toBe('unknown');
  });
});
