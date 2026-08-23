import { Screen } from '@/components/Screen';
import { achievements, getCountriesByContinent, getCountryById } from '@/data';
import { earnedAchievementIds, type AchievementContext } from '@/lib/game-engine';
import { useProgress } from '@/app/providers/ProgressProvider';
import { CONTINENTS, type Continent } from '@/types';

/** S09 Achievements — badge grid with earned/locked state (PRD §9, §13, FR-013). */
export function AchievementsScreen() {
  const { discoveredCountryIds, topicMastery, stats } = useProgress();

  const byContinent = getCountriesByContinent();
  const continentTotals = new Map<Continent, number>(
    CONTINENTS.map((c) => [c, byContinent.get(c)?.length ?? 0])
  );
  const discoveredByContinent = new Map<Continent, number>(CONTINENTS.map((c) => [c, 0]));
  for (const id of discoveredCountryIds) {
    const continent = getCountryById(id)?.continent;
    if (continent) discoveredByContinent.set(continent, (discoveredByContinent.get(continent) ?? 0) + 1);
  }

  const ctx: AchievementContext = {
    discoveredCountryIds,
    topicMastery,
    discoveredByContinent,
    continentTotals,
    gamesCompleted: stats.gamesCompleted,
  };
  const earned = earnedAchievementIds(achievements, ctx);
  const earnedCount = earned.size;

  return (
    <Screen title="Badges" subtitle={`${earnedCount} of ${achievements.length} earned.`}>
      <div className="badge-grid">
        {achievements.map((a) => {
          const isEarned = earned.has(a.id);
          return (
            <div key={a.id} className={isEarned ? 'badge' : 'badge badge--locked'}>
              <span className="badge__icon" aria-hidden="true">
                {isEarned ? a.icon : '🔒'}
              </span>
              <span className="badge__name">{a.name}</span>
              <span className="badge__desc">{a.description}</span>
              <span className="badge__status">{isEarned ? '✓ Earned' : 'Locked'}</span>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
