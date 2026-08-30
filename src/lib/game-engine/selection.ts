import type { AgeBand, Difficulty, Progress, Question, Topic } from '@/types';
import { MASTERY_START, difficultyForMastery } from './mastery';
import { seededShuffle } from './random';

/**
 * Adaptive question selection (PRD §10, FR-014, AC-10).
 *
 * Pure and deterministic given its inputs. Selection responds to recent
 * performance by reading per-topic mastery: it targets the difficulty band that
 * matches the child's current mastery, prioritises weaker topics, and avoids
 * repeating recently-seen questions.
 */

const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Storage key for a topic's mastery record. */
export function topicKey(topic: Topic): string {
  return `topic:${topic}`;
}

export interface SelectionContext {
  ageBand: AgeBand;
  /** Progress keyed by `topic:<topic>` and by country id. */
  progress?: ReadonlyMap<string, Progress>;
  /** Questions to avoid re-showing (e.g. seen earlier this session). */
  recentQuestionIds?: ReadonlySet<string>;
  /** Seed for deterministic tie-breaking / variety. */
  seed?: string;
}

export function topicMastery(topic: Topic, ctx: SelectionContext): number {
  return ctx.progress?.get(topicKey(topic))?.masteryScore ?? MASTERY_START;
}

/**
 * Score how appropriate a question is to show now (higher = better).
 * Exposed for testing; the weights are intentionally simple and legible.
 */
export function selectionScore(question: Question, ctx: SelectionContext): number {
  if (ctx.recentQuestionIds?.has(question.id)) return -Infinity;

  const mastery = topicMastery(question.topic, ctx);
  // The expert (grown-up) tier always targets the hardest questions; everyone else
  // is matched to the difficulty band their current mastery has reached.
  const target: Difficulty = ctx.ageBand === 'expert' ? 'hard' : difficultyForMastery(mastery);
  const distance = Math.abs(DIFFICULTY_ORDER[question.difficulty] - DIFFICULTY_ORDER[target]);
  const difficultyFit = 1 - distance / 2; // 1 when matched, 0.5 adjacent, 0 far

  const weakness = (100 - mastery) / 100; // weaker topics score higher

  return difficultyFit * 1 + weakness * 1;
}

function eligible(question: Question, ctx: SelectionContext): boolean {
  return question.active && question.ageBands.includes(ctx.ageBand);
}

/**
 * Select up to `count` distinct questions from `pool`, best-first. Ties are
 * broken by a seeded shuffle so repeated sessions vary rather than always
 * returning the same order.
 */
export function selectQuestions(
  pool: readonly Question[],
  ctx: SelectionContext,
  count: number
): Question[] {
  const shuffled = seededShuffle(
    pool.filter((q) => eligible(q, ctx)),
    ctx.seed ?? 'default'
  );
  return shuffled
    .map((q) => ({ q, score: selectionScore(q, ctx) }))
    .filter((x) => Number.isFinite(x.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, count))
    .map((x) => x.q);
}

/** Convenience: pick the single best next question, or undefined if none fit. */
export function selectNextQuestion(
  pool: readonly Question[],
  ctx: SelectionContext
): Question | undefined {
  return selectQuestions(pool, ctx, 1)[0];
}
