import { describe, expect, it } from 'vitest';
import { applyAnswer, createProgress, scoreAnswer } from '@/lib/game-engine';
import type { Question } from '@/types';

const question: Question = {
  id: 'q-flag-fr-01',
  type: 'flag-detective',
  difficulty: 'medium',
  ageBands: ['8-10'],
  topic: 'flags',
  prompt: 'Which country does this flag belong to?',
  options: ['fr', 'it', 'de', 'es'],
  correctAnswer: 'fr',
  explanation: 'This is the flag of France. Its capital is Paris.',
  countryId: 'fr',
  active: true,
  source: 'fixture',
};

describe('scoreAnswer', () => {
  it('marks the correct option correct', () => {
    const r = scoreAnswer(question, 'fr');
    expect(r.correct).toBe(true);
    expect(r.correctAnswer).toBe('fr');
    expect(r.explanation).toContain('France');
  });

  it('marks a wrong option incorrect but still returns the explanation', () => {
    const r = scoreAnswer(question, 'it');
    expect(r.correct).toBe(false);
    expect(r.explanation).toContain('France');
  });
});

describe('applyAnswer', () => {
  it('increments attempts and correct, and raises mastery on a correct answer', () => {
    const start = createProgress('fr');
    const next = applyAnswer(start, true, question.difficulty, '2026-01-01T00:00:00.000Z');
    expect(next.attempts).toBe(1);
    expect(next.correct).toBe(1);
    expect(next.masteryScore).toBeGreaterThan(start.masteryScore);
    expect(next.lastPlayedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('increments attempts but not correct on a wrong answer', () => {
    const start = createProgress('fr');
    const next = applyAnswer(start, false, question.difficulty);
    expect(next.attempts).toBe(1);
    expect(next.correct).toBe(0);
    expect(next.masteryScore).toBeLessThan(start.masteryScore);
  });

  it('does not mutate the input record', () => {
    const start = createProgress('fr');
    applyAnswer(start, true, question.difficulty);
    expect(start.attempts).toBe(0);
  });
});
