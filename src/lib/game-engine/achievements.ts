import type { Achievement, Continent, Topic } from '@/types';
import { MASTERED_THRESHOLD } from './mastery';

/**
 * Pure achievement evaluation (PRD §9, FR-013). Given a snapshot of the player's
 * progress, decide which badges are earned. No storage, no React — the caller
 * assembles the context from persisted progress.
 */
export interface AchievementContext {
  discoveredCountryIds: ReadonlySet<string>;
  /** Topic → mastery score (0-100). */
  topicMastery: ReadonlyMap<Topic, number>;
  discoveredByContinent: ReadonlyMap<Continent, number>;
  continentTotals: ReadonlyMap<Continent, number>;
  gamesCompleted: number;
}

export function isAchievementEarned(achievement: Achievement, ctx: AchievementContext): boolean {
  const c = achievement.criteria;
  switch (c.kind) {
    case 'countries-discovered':
      return ctx.discoveredCountryIds.size >= c.threshold;
    case 'topic-mastered':
      return c.topic ? (ctx.topicMastery.get(c.topic) ?? 0) >= MASTERED_THRESHOLD : false;
    case 'continent-completed': {
      if (!c.continent) return false;
      const total = ctx.continentTotals.get(c.continent) ?? 0;
      const discovered = ctx.discoveredByContinent.get(c.continent) ?? 0;
      return total > 0 && discovered >= total;
    }
    case 'games-completed':
      return ctx.gamesCompleted >= c.threshold;
    default:
      return false;
  }
}

export function earnedAchievementIds(
  achievements: readonly Achievement[],
  ctx: AchievementContext
): Set<string> {
  return new Set(
    achievements.filter((a) => a.active && isAchievementEarned(a, ctx)).map((a) => a.id)
  );
}
