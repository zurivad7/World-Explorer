import { describe, expect, it } from 'vitest';
import type { Country } from '@/types';
import { speedRunPool } from '@/features/games/speedrun/speedRunModes';
import { choiceOptions, shuffledDeck } from '@/features/games/speedrun/speedRunDeck';
import { isSpeedRunAllowed } from '@/features/games/speedrun/age';

function country(id: string, area: number): Country {
  return {
    id,
    iso2: id,
    iso3: id.toUpperCase(),
    name: id.toUpperCase(),
    capital: `${id}-city`,
    continent: 'Europe',
    region: 'Test',
    flagAsset: `/assets/flags/${id}.svg`,
    geometryId: id,
    neighbours: [],
    facts: [],
    area,
    landlocked: false,
    languages: ['Testish'],
    active: true,
    source: 'test',
  };
}

const sample: Country[] = [
  country('big', 500_000),
  country('mid', 80_000),
  country('tiny', 300),
  country('small', 1_000),
];

describe('speedRunPool', () => {
  it('lets flags and capitals use every active country', () => {
    expect(speedRunPool('flag', sample)).toHaveLength(4);
    expect(speedRunPool('capital', sample)).toHaveLength(4);
  });

  it('limits find-it to countries large enough to tap on a map', () => {
    const ids = speedRunPool('find-it', sample).map((c) => c.id);
    expect(ids).toContain('big');
    expect(ids).toContain('mid');
    expect(ids).not.toContain('tiny');
    expect(ids).not.toContain('small');
  });
});

describe('choiceOptions', () => {
  it('always includes the target and the requested number of distinct options', () => {
    const options = choiceOptions(sample[0]!, sample, 'seed', 4);
    expect(options).toHaveLength(4);
    expect(options.map((c) => c.id)).toContain('big');
    expect(new Set(options.map((c) => c.id)).size).toBe(4);
  });

  it('is deterministic for a given seed', () => {
    expect(choiceOptions(sample[0]!, sample, 'seed')).toEqual(choiceOptions(sample[0]!, sample, 'seed'));
  });
});

describe('shuffledDeck', () => {
  it('keeps every country and is deterministic per seed', () => {
    const deck = shuffledDeck(sample, 'abc');
    expect(deck).toHaveLength(4);
    expect(new Set(deck.map((c) => c.id)).size).toBe(4);
    expect(shuffledDeck(sample, 'abc')).toEqual(deck);
  });
});

describe('isSpeedRunAllowed', () => {
  it('is for ages 8 and up only', () => {
    expect(isSpeedRunAllowed('5-7')).toBe(false);
    expect(isSpeedRunAllowed('8-10')).toBe(true);
    expect(isSpeedRunAllowed('11-13')).toBe(true);
    expect(isSpeedRunAllowed(undefined)).toBe(false);
  });
});
