import type { GameMode, Question } from '@/types';
import { seededShuffle } from './random';

/**
 * Daily challenge selection (PRD §11 FR-015).
 *
 * Deterministic per calendar day: everyone on the same day (same device-local
 * date) gets the same set, and it changes each day. Drawn entirely from the
 * local content bank so it works offline. Favours variety across game modes.
 */

/** Local calendar date as `YYYY-MM-DD` (no time, no timezone surprises). */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Pick `count` questions for the given day, spread across game modes. Round-robins
 * one question per mode (in a day-seeded mode order) before taking a second from
 * any mode, so a short daily set samples different games.
 */
export function dailyChallengeQuestions(
  pool: readonly Question[],
  dateKey: string = localDateKey(),
  count = 5
): Question[] {
  const active = pool.filter((q) => q.active);
  if (active.length === 0) return [];

  const byMode = new Map<GameMode, Question[]>();
  for (const q of active) {
    const list = byMode.get(q.type) ?? [];
    list.push(q);
    byMode.set(q.type, list);
  }

  // Deterministic per-day ordering of modes and of questions within each mode.
  const modes = seededShuffle([...byMode.keys()], `daily-modes-${dateKey}`);
  const queues = new Map<GameMode, Question[]>(
    modes.map((m) => [m, seededShuffle(byMode.get(m)!, `daily-${m}-${dateKey}`)])
  );

  const picked: Question[] = [];
  const seen = new Set<string>();
  let exhaustedPasses = 0;
  while (picked.length < count && exhaustedPasses < modes.length) {
    exhaustedPasses = 0;
    for (const mode of modes) {
      if (picked.length >= count) break;
      const next = queues.get(mode)!.shift();
      if (!next) {
        exhaustedPasses++;
        continue;
      }
      if (!seen.has(next.id)) {
        seen.add(next.id);
        picked.push(next);
      }
    }
  }
  return picked;
}
