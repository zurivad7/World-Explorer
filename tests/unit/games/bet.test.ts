import { describe, expect, it } from 'vitest';
import { WAGER_TIERS, scoreBet } from '@/features/games/bet';

describe('WAGER_TIERS', () => {
  it('offers three increasing confidence levels', () => {
    expect(WAGER_TIERS).toHaveLength(3);
    const points = WAGER_TIERS.map((t) => t.points);
    expect(points).toEqual([...points].sort((a, b) => a - b));
    expect(new Set(points).size).toBe(3);
  });
});

describe('scoreBet', () => {
  it('adds the wager on a correct answer', () => {
    expect(scoreBet(true, 20, 50)).toEqual({ total: 70, delta: 20 });
  });

  it('subtracts the wager on a wrong answer', () => {
    expect(scoreBet(false, 20, 50)).toEqual({ total: 30, delta: -20 });
  });

  it('never drops the running total below zero', () => {
    const outcome = scoreBet(false, 30, 10);
    expect(outcome.delta).toBe(-30);
    expect(outcome.total).toBe(0);
  });

  it('starts from zero cleanly', () => {
    expect(scoreBet(true, 10, 0)).toEqual({ total: 10, delta: 10 });
    expect(scoreBet(false, 10, 0)).toEqual({ total: 0, delta: -10 });
  });
});
