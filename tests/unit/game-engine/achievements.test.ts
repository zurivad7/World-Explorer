import { describe, expect, it } from 'vitest';
import { earnedAchievementIds, isAchievementEarned } from '@/lib/game-engine';
import type { AchievementContext } from '@/lib/game-engine';
import type { Achievement, Continent } from '@/types';

function ctx(over: Partial<AchievementContext> = {}): AchievementContext {
  return {
    discoveredCountryIds: new Set(),
    topicMastery: new Map(),
    discoveredByContinent: new Map<Continent, number>(),
    continentTotals: new Map<Continent, number>(),
    gamesCompleted: 0,
    ...over,
  };
}

const discovered: Achievement = {
  id: 'globe',
  name: 'Globe Trotter',
  description: '',
  icon: '🌍',
  criteria: { kind: 'countries-discovered', threshold: 3 },
  active: true,
};

const topicMastered: Achievement = {
  id: 'flag-finder',
  name: 'Flag Finder',
  description: '',
  icon: '🚩',
  criteria: { kind: 'topic-mastered', threshold: 1, topic: 'flags' },
  active: true,
};

describe('isAchievementEarned', () => {
  it('countries-discovered earns at the threshold', () => {
    expect(isAchievementEarned(discovered, ctx({ discoveredCountryIds: new Set(['a', 'b']) }))).toBe(false);
    expect(
      isAchievementEarned(discovered, ctx({ discoveredCountryIds: new Set(['a', 'b', 'c']) }))
    ).toBe(true);
  });

  it('topic-mastered earns at the mastery threshold (80)', () => {
    expect(isAchievementEarned(topicMastered, ctx({ topicMastery: new Map([['flags', 79]]) }))).toBe(false);
    expect(isAchievementEarned(topicMastered, ctx({ topicMastery: new Map([['flags', 80]]) }))).toBe(true);
  });

  it('continent-completed needs every country in the continent', () => {
    const a: Achievement = {
      id: 'africa',
      name: '',
      description: '',
      icon: '',
      criteria: { kind: 'continent-completed', threshold: 1, continent: 'Africa' },
      active: true,
    };
    const totals = new Map<Continent, number>([['Africa', 3]]);
    expect(
      isAchievementEarned(a, ctx({ continentTotals: totals, discoveredByContinent: new Map([['Africa', 2]]) }))
    ).toBe(false);
    expect(
      isAchievementEarned(a, ctx({ continentTotals: totals, discoveredByContinent: new Map([['Africa', 3]]) }))
    ).toBe(true);
  });
});

describe('earnedAchievementIds', () => {
  it('returns only earned, active badges', () => {
    const earned = earnedAchievementIds([discovered, topicMastered], {
      ...ctx(),
      discoveredCountryIds: new Set(['a', 'b', 'c']),
      topicMastery: new Map([['flags', 90]]),
    });
    expect(earned).toEqual(new Set(['globe', 'flag-finder']));
  });
});
