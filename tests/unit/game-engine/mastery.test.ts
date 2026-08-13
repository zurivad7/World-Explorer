import { describe, expect, it } from 'vitest';
import {
  MASTERY_MAX,
  MASTERY_MIN,
  MASTERY_START,
  clampMastery,
  createProgress,
  difficultyForMastery,
  isMastered,
  updateMastery,
} from '@/lib/game-engine';

describe('clampMastery', () => {
  it('keeps values within 0-100', () => {
    expect(clampMastery(-10)).toBe(MASTERY_MIN);
    expect(clampMastery(150)).toBe(MASTERY_MAX);
    expect(clampMastery(50)).toBe(50);
  });

  it('falls back to start value on NaN', () => {
    expect(clampMastery(Number.NaN)).toBe(MASTERY_START);
  });
});

describe('updateMastery', () => {
  it('increases on a correct answer', () => {
    expect(updateMastery(40, true, 'medium')).toBeGreaterThan(40);
  });

  it('decreases modestly on an incorrect answer', () => {
    const next = updateMastery(40, false, 'medium');
    expect(next).toBeLessThan(40);
    // "modest" — an incorrect answer should not wipe out more than a correct one adds.
    expect(40 - next).toBeLessThanOrEqual(updateMastery(40, true, 'medium') - 40);
  });

  it('rewards harder questions more', () => {
    expect(updateMastery(40, true, 'hard')).toBeGreaterThan(updateMastery(40, true, 'easy'));
  });

  it('never leaves the 0-100 range', () => {
    expect(updateMastery(2, false, 'easy')).toBe(MASTERY_MIN);
    expect(updateMastery(98, true, 'hard')).toBe(MASTERY_MAX);
  });
});

describe('difficultyForMastery', () => {
  it('maps low/mid/high scores to difficulty bands', () => {
    expect(difficultyForMastery(10)).toBe('easy');
    expect(difficultyForMastery(50)).toBe('medium');
    expect(difficultyForMastery(90)).toBe('hard');
  });
});

describe('isMastered', () => {
  it('is true at or above threshold', () => {
    expect(isMastered(80)).toBe(true);
    expect(isMastered(79)).toBe(false);
  });
});

describe('createProgress', () => {
  it('creates a zeroed record at the start mastery', () => {
    const p = createProgress('topic:flags');
    expect(p).toEqual({
      key: 'topic:flags',
      attempts: 0,
      correct: 0,
      masteryScore: MASTERY_START,
    });
  });
});
