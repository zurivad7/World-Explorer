import type { Difficulty, Progress } from '@/types';

/**
 * Mastery model (PRD §10).
 *
 * A simple local mastery score (0-100) per topic/country. Correct answers raise
 * it, incorrect answers lower it modestly. This is intentionally *not* an ML
 * system — it is a small, pure, unit-testable function.
 */

export const MASTERY_MIN = 0;
export const MASTERY_MAX = 100;
export const MASTERY_START = 40;

/** Difficulty of a question changes how much mastery moves. */
const CORRECT_GAIN: Record<Difficulty, number> = {
  easy: 6,
  medium: 10,
  hard: 15,
};

const INCORRECT_LOSS: Record<Difficulty, number> = {
  easy: 6,
  medium: 4,
  hard: 3,
};

export function clampMastery(score: number): number {
  if (Number.isNaN(score)) return MASTERY_START;
  return Math.max(MASTERY_MIN, Math.min(MASTERY_MAX, score));
}

/**
 * Compute the next mastery score after an answer. Incorrect answers decrease
 * mastery *modestly* so a child is never punished hard for a single mistake.
 */
export function updateMastery(current: number, correct: boolean, difficulty: Difficulty): number {
  const delta = correct ? CORRECT_GAIN[difficulty] : -INCORRECT_LOSS[difficulty];
  return clampMastery(current + delta);
}

/** Map a mastery score to a difficulty band for adaptive question selection. */
export function difficultyForMastery(score: number): Difficulty {
  const s = clampMastery(score);
  if (s < 34) return 'easy';
  if (s < 67) return 'medium';
  return 'hard';
}

/** A topic/country is considered "mastered" at or above this threshold. */
export const MASTERED_THRESHOLD = 80;

export function isMastered(score: number): boolean {
  return clampMastery(score) >= MASTERED_THRESHOLD;
}

/** Create a fresh Progress record for a topic or country key. */
export function createProgress(key: string): Progress {
  return {
    key,
    attempts: 0,
    correct: 0,
    masteryScore: MASTERY_START,
  };
}
