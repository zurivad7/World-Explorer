/**
 * "Bet Your Knowledge" scoring (a wager layer over ordinary questions).
 *
 * Before answering, the player bets how sure they are. A correct answer wins the
 * wagered points; a wrong one loses them — but the running total never drops below
 * zero, so a bold wrong guess stings without being punishing for younger players.
 * Pure and unit-tested; the UI (QuizScreen) owns the running total.
 */

export interface WagerTier {
  points: number;
  label: string;
  icon: string;
}

/** The three confidence levels a player can bet, from cautious to bold. */
export const WAGER_TIERS: readonly WagerTier[] = [
  { points: 10, label: 'Safe', icon: '🙂' },
  { points: 20, label: 'Sure', icon: '😃' },
  { points: 30, label: 'Certain', icon: '🤩' },
] as const;

export interface BetOutcome {
  /** New running total after applying the wager (never below zero). */
  total: number;
  /** Points gained (positive) or lost (negative) on this question. */
  delta: number;
}

/** Apply a wager: win the points when correct, lose them when wrong, floored at zero. */
export function scoreBet(correct: boolean, wager: number, total: number): BetOutcome {
  const delta = correct ? wager : -wager;
  return { total: Math.max(0, total + delta), delta };
}
