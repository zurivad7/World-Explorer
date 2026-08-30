import { describe, expect, it } from 'vitest';
import { availableGameModes, hasQuestionsForAge } from '@/features/games/availability';
import { GAME_MODE_META } from '@/features/games/gameModes';

// Runs against the real generated question bank, so it guards the age↔content
// contract: no Game Hub card may ever open to a "no questions" screen.
describe('game availability by age band', () => {
  it('never lists a card with no age-appropriate questions', () => {
    for (const band of ['5-7', '8-10', '11-13', 'expert'] as const) {
      for (const meta of availableGameModes(band)) {
        expect(hasQuestionsForAge(meta.mode, band)).toBe(true);
      }
    }
  });

  it('hides the reasoning games from the 5–7 band but keeps the basics', () => {
    const young = availableGameModes('5-7').map((m) => m.mode);
    expect(young).not.toContain('find-the-lie');
    expect(young).not.toContain('odd-one-out');
    expect(young).not.toContain('border-battle');
    expect(young).toContain('flag-detective');
    expect(young).toContain('capital-challenge');
    // Continent Challenge is a fundamental skill offered to every band.
    expect(young).toContain('continent-challenge');
  });

  it('offers Continent Challenge to the 11–13 band (was an easy-tier gap)', () => {
    expect(hasQuestionsForAge('continent-challenge', '11-13')).toBe(true);
  });

  it('shows every standalone game to the 8–10 band and up', () => {
    for (const band of ['8-10', '11-13', 'expert'] as const) {
      expect(availableGameModes(band)).toHaveLength(GAME_MODE_META.length);
    }
  });

  it('always offers Bet Your Knowledge (it draws from the whole bank)', () => {
    for (const band of ['5-7', '8-10', '11-13', 'expert'] as const) {
      expect(hasQuestionsForAge('bet-your-knowledge', band)).toBe(true);
    }
  });
});
