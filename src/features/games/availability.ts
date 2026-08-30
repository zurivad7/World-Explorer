import type { AgeBand, GameMode } from '@/types';
import { getQuestionsForMode } from '@/data/questions';
import { GAME_MODE_META, type GameModeMeta } from './gameModes';

/**
 * Whether a game mode has any question a player of `ageBand` can be shown. Used to
 * hide Game Hub cards that would otherwise lead to a "no questions" dead end (e.g. the
 * reasoning games are `medium`, so they have nothing for the 5–7 band). `bet-your-
 * knowledge` has no questions of its own — it draws a mixed set from the whole bank —
 * so it is always available.
 */
export function hasQuestionsForAge(mode: GameMode, ageBand: AgeBand): boolean {
  if (mode === 'bet-your-knowledge') return true;
  return getQuestionsForMode(mode).some((q) => q.ageBands.includes(ageBand));
}

/** The game cards a player of `ageBand` should see, in their declared order. */
export function availableGameModes(ageBand: AgeBand): GameModeMeta[] {
  return GAME_MODE_META.filter((m) => hasQuestionsForAge(m.mode, ageBand));
}
