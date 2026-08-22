import { describe, expect, it } from 'vitest';
import {
  advance,
  answerCurrent,
  createSession,
  currentQuestion,
  isCurrentAnswered,
  sessionSummary,
} from '@/lib/game-engine';
import type { Question } from '@/types';

function makeQuestion(id: string, correct: string): Question {
  return {
    id,
    type: 'capital-challenge',
    difficulty: 'easy',
    ageBands: ['8-10'],
    topic: 'capitals',
    prompt: `Q ${id}`,
    options: [correct, 'other'],
    correctAnswer: correct,
    explanation: `Because ${correct}.`,
    active: true,
    source: 'test',
  };
}

const questions = [makeQuestion('q1', 'a'), makeQuestion('q2', 'b')];

describe('createSession', () => {
  it('starts at the first question and is unfinished', () => {
    const s = createSession(questions);
    expect(currentQuestion(s)?.id).toBe('q1');
    expect(s.finished).toBe(false);
  });

  it('an empty session is immediately finished', () => {
    expect(createSession([]).finished).toBe(true);
  });
});

describe('answerCurrent', () => {
  it('records a correct answer and returns feedback without advancing', () => {
    const s0 = createSession(questions);
    const { session, result } = answerCurrent(s0, 'a');
    expect(result.correct).toBe(true);
    expect(result.explanation).toContain('a');
    expect(session.correctCount).toBe(1);
    expect(currentQuestion(session)?.id).toBe('q1'); // not advanced
    expect(isCurrentAnswered(session)).toBe(true);
  });

  it('records a wrong answer but still returns the correct answer + explanation', () => {
    const { session, result } = answerCurrent(createSession(questions), 'other');
    expect(result.correct).toBe(false);
    expect(result.correctAnswer).toBe('a');
    expect(session.correctCount).toBe(0);
    expect(session.answers).toHaveLength(1);
  });

  it('is a no-op when the same question is answered twice', () => {
    const first = answerCurrent(createSession(questions), 'a').session;
    const second = answerCurrent(first, 'other');
    expect(second.session.answers).toHaveLength(1);
    expect(second.result.correct).toBe(true);
  });
});

describe('advance + summary', () => {
  it('plays through a whole session and finishes', () => {
    let s = createSession(questions);
    s = answerCurrent(s, 'a').session;
    s = advance(s);
    expect(currentQuestion(s)?.id).toBe('q2');
    expect(s.finished).toBe(false);
    s = answerCurrent(s, 'wrong').session;
    s = advance(s);
    expect(s.finished).toBe(true);
    expect(currentQuestion(s)).toBeUndefined();

    const summary = sessionSummary(s);
    expect(summary).toEqual({ total: 2, correct: 1, accuracy: 0.5 });
  });

  it('does not advance past the end', () => {
    let s = createSession([makeQuestion('only', 'a')]);
    s = advance(s);
    s = advance(s);
    expect(s.index).toBe(1);
    expect(s.finished).toBe(true);
  });
});
