import { describe, expect, it } from 'vitest';
import { answerMatches, normalizeAnswer } from '@/lib/game-engine';

describe('normalizeAnswer', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalizeAnswer('  Paris  ')).toBe('paris');
    expect(normalizeAnswer('New   York')).toBe('new york');
  });

  it('strips accents and punctuation', () => {
    expect(normalizeAnswer('Brasília')).toBe('brasilia');
    expect(normalizeAnswer('Washington, D.C.')).toBe('washington d c');
  });
});

describe('answerMatches', () => {
  it('accepts exact and case/accent-insensitive spellings', () => {
    expect(answerMatches('paris', 'Paris')).toBe(true);
    expect(answerMatches('BRASILIA', 'Brasília')).toBe(true);
  });

  it('accepts the part before a comma', () => {
    expect(answerMatches('Washington', 'Washington, D.C.')).toBe(true);
  });

  it('rejects wrong answers and empty input', () => {
    expect(answerMatches('London', 'Paris')).toBe(false);
    expect(answerMatches('   ', 'Paris')).toBe(false);
  });
});
