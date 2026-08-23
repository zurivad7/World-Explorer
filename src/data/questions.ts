import type { GameMode, Question } from '@/types';
import questionsJson from './questions/questions.generated.json';

/**
 * The question bank, in its own module so the ~180KB of generated question JSON
 * is only pulled into the chunk that actually plays games (the lazy-loaded games
 * route) — not the initial bundle (PRD §23). Country metadata lives in `@/data`.
 */
export const questions = questionsJson as unknown as Question[];

export function getQuestionsForMode(mode: GameMode): Question[] {
  return questions.filter((q) => q.type === mode && q.active);
}
