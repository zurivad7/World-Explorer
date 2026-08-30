import { describe, expect, it } from 'vitest';
import {
  createProgress,
  selectNextQuestion,
  selectQuestions,
  selectionScore,
  topicKey,
} from '@/lib/game-engine';
import type { AgeBand, Difficulty, Question, Topic } from '@/types';

let counter = 0;
function q(overrides: Partial<Question> & { topic: Topic; difficulty: Difficulty }): Question {
  counter += 1;
  return {
    id: `q-${counter}`,
    type: 'flag-detective',
    ageBands: ['5-7', '8-10', '11-13'],
    prompt: 'p',
    options: ['a', 'b'],
    correctAnswer: 'a',
    explanation: 'e',
    active: true,
    source: 'test',
    ...overrides,
  };
}

const ctx = (ageBand: AgeBand = '8-10') => ({ ageBand });

describe('selectQuestions — eligibility', () => {
  it('excludes questions outside the age band', () => {
    const pool = [
      q({ id: 'young', topic: 'flags', difficulty: 'easy', ageBands: ['5-7'] }),
      q({ id: 'mid', topic: 'flags', difficulty: 'medium', ageBands: ['8-10'] }),
    ];
    const picked = selectQuestions(pool, ctx('8-10'), 10).map((x) => x.id);
    expect(picked).toContain('mid');
    expect(picked).not.toContain('young');
  });

  it('excludes inactive questions', () => {
    const pool = [q({ topic: 'flags', difficulty: 'medium', active: false })];
    expect(selectQuestions(pool, ctx(), 5)).toHaveLength(0);
  });

  it('never returns recently-seen questions', () => {
    const pool = [
      q({ id: 'seen', topic: 'flags', difficulty: 'medium' }),
      q({ id: 'fresh', topic: 'flags', difficulty: 'medium' }),
    ];
    const picked = selectQuestions(
      pool,
      { ageBand: '8-10', recentQuestionIds: new Set(['seen']) },
      10
    ).map((x) => x.id);
    expect(picked).toEqual(['fresh']);
  });
});

describe('selectionScore — adaptivity (AC-10)', () => {
  it('prefers the difficulty matching current mastery', () => {
    // Low mastery -> easy questions should outscore hard ones.
    const progress = new Map([
      [topicKey('capitals'), { ...createProgress(topicKey('capitals')), masteryScore: 10 }],
    ]);
    const lowMastery = { ageBand: '8-10' as AgeBand, progress };
    const easy = q({ topic: 'capitals', difficulty: 'easy' });
    const hard = q({ topic: 'capitals', difficulty: 'hard' });
    expect(selectionScore(easy, lowMastery)).toBeGreaterThan(selectionScore(hard, lowMastery));
  });

  it('shifts toward harder questions as mastery rises', () => {
    const progress = new Map([[topicKey('capitals'), { ...createProgress(topicKey('capitals')), masteryScore: 95 }]]);
    const strong = { ageBand: '8-10' as AgeBand, progress };
    const easy = q({ topic: 'capitals', difficulty: 'easy' });
    const hard = q({ topic: 'capitals', difficulty: 'hard' });
    expect(selectionScore(hard, strong)).toBeGreaterThan(selectionScore(easy, strong));
  });

  it('the expert tier prefers hard questions regardless of mastery', () => {
    // A fresh expert (mastery at the default, which would otherwise target "medium")
    // should still rank a hard question above an easy one.
    const expert = { ageBand: 'expert' as AgeBand };
    const easy = q({ topic: 'capitals', difficulty: 'easy', ageBands: ['expert'] });
    const hard = q({ topic: 'capitals', difficulty: 'hard', ageBands: ['expert'] });
    expect(selectionScore(hard, expert)).toBeGreaterThan(selectionScore(easy, expert));
  });

  it('prioritises weaker topics when difficulty fit is equal', () => {
    const progress = new Map([
      [topicKey('flags'), { ...createProgress(topicKey('flags')), masteryScore: 20 }],
      [topicKey('capitals'), { ...createProgress(topicKey('capitals')), masteryScore: 90 }],
    ]);
    const context = { ageBand: '8-10' as AgeBand, progress };
    const weakEasy = q({ topic: 'flags', difficulty: 'easy' });
    const strongHard = q({ topic: 'capitals', difficulty: 'hard' });
    // Both are difficulty-matched to their topic mastery; the weaker topic wins.
    expect(selectionScore(weakEasy, context)).toBeGreaterThan(selectionScore(strongHard, context));
  });
});

describe('selectQuestions — determinism & count', () => {
  const pool = Array.from({ length: 10 }, () => q({ topic: 'flags', difficulty: 'medium' }));

  it('returns exactly the requested count', () => {
    expect(selectQuestions(pool, { ageBand: '8-10', seed: 's' }, 4)).toHaveLength(4);
  });

  it('is deterministic for a given seed', () => {
    const a = selectQuestions(pool, { ageBand: '8-10', seed: 'seed-1' }, 5).map((x) => x.id);
    const b = selectQuestions(pool, { ageBand: '8-10', seed: 'seed-1' }, 5).map((x) => x.id);
    expect(a).toEqual(b);
  });

  it('returns distinct questions', () => {
    const ids = selectQuestions(pool, { ageBand: '8-10', seed: 's' }, 6).map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('selectNextQuestion returns undefined when nothing fits', () => {
    expect(selectNextQuestion([], { ageBand: '8-10' })).toBeUndefined();
  });
});
