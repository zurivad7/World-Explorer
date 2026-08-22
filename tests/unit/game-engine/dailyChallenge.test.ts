import { describe, expect, it } from 'vitest';
import { dailyChallengeQuestions, localDateKey } from '@/lib/game-engine';
import type { GameMode, Question } from '@/types';

let n = 0;
function q(type: GameMode): Question {
  n += 1;
  return {
    id: `${type}-${n}`,
    type,
    difficulty: 'easy',
    ageBands: ['8-10'],
    topic: 'flags',
    prompt: 'p',
    options: ['a', 'b'],
    correctAnswer: 'a',
    explanation: 'e',
    active: true,
    source: 'test',
  };
}

const modes: GameMode[] = ['flag-detective', 'capital-challenge', 'continent-challenge'];
const pool = modes.flatMap((m) => [q(m), q(m), q(m)]);

describe('localDateKey', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('dailyChallengeQuestions', () => {
  it('is deterministic for a given date', () => {
    const a = dailyChallengeQuestions(pool, '2026-08-22', 5).map((x) => x.id);
    const b = dailyChallengeQuestions(pool, '2026-08-22', 5).map((x) => x.id);
    expect(a).toEqual(b);
  });

  it('changes from one day to the next', () => {
    const a = dailyChallengeQuestions(pool, '2026-08-22', 5).map((x) => x.id);
    const b = dailyChallengeQuestions(pool, '2026-08-23', 5).map((x) => x.id);
    expect(a).not.toEqual(b);
  });

  it('returns the requested count with no duplicates', () => {
    const picked = dailyChallengeQuestions(pool, '2026-08-22', 5);
    expect(picked).toHaveLength(5);
    expect(new Set(picked.map((x) => x.id)).size).toBe(5);
  });

  it('spreads across game modes (variety)', () => {
    const picked = dailyChallengeQuestions(pool, '2026-08-22', 3);
    expect(new Set(picked.map((x) => x.type)).size).toBe(3);
  });

  it('handles a pool smaller than the requested count', () => {
    const tiny = [q('flag-detective')];
    expect(dailyChallengeQuestions(tiny, '2026-08-22', 5)).toHaveLength(1);
  });

  it('returns nothing for an empty pool', () => {
    expect(dailyChallengeQuestions([], '2026-08-22', 5)).toEqual([]);
  });
});
