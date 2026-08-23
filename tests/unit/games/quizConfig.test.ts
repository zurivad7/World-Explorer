import { describe, expect, it } from 'vitest';
import { isMapQuestion, optionKind, promptShowsFlag } from '@/features/games/quizConfig';
import type { Question } from '@/types';

function make(id: string, type: Question['type']): Question {
  return {
    id,
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

describe('optionKind', () => {
  it('flag→country shows country-name options', () => {
    expect(optionKind(make('flag-detective-flag-fr', 'flag-detective'))).toBe('country-name');
  });
  it('country→flag shows flag options', () => {
    expect(optionKind(make('flag-detective-country-fr', 'flag-detective'))).toBe('country-flag');
  });
  it('capital direction shows text options', () => {
    expect(optionKind(make('capital-challenge-capital-fr', 'capital-challenge'))).toBe('text');
  });
  it('country direction (capital) shows country-name options', () => {
    expect(optionKind(make('capital-challenge-country-fr', 'capital-challenge'))).toBe('country-name');
  });
  it('continent options are text', () => {
    expect(optionKind(make('continent-challenge-fr', 'continent-challenge'))).toBe('text');
  });
  it('flag builder options are colours', () => {
    expect(optionKind(make('flag-builder-fr', 'flag-builder'))).toBe('colours');
  });
});

describe('promptShowsFlag / isMapQuestion', () => {
  it('shows a flag prompt only for the flag→country direction', () => {
    expect(promptShowsFlag(make('flag-detective-flag-fr', 'flag-detective'))).toBe(true);
    expect(promptShowsFlag(make('flag-detective-country-fr', 'flag-detective'))).toBe(false);
  });
  it('flags map-find-it questions', () => {
    expect(isMapQuestion(make('map-find-it-fr', 'map-find-it'))).toBe(true);
    expect(isMapQuestion(make('continent-challenge-fr', 'continent-challenge'))).toBe(false);
  });
});
