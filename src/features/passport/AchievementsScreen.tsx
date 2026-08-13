import { Screen } from '@/components/Screen';
import { achievements } from '@/data';

/** S09 Achievements — badge grid with earned/locked state (PRD §13). Earned state wired in Phase 5. */
export function AchievementsScreen() {
  return (
    <Screen title="Badges" subtitle="Earn badges by learning about the world.">
      <div className="badge-grid">
        {achievements.map((a) => (
          <div key={a.id} className="badge badge--locked">
            <span className="badge__icon" aria-hidden="true">
              {a.icon}
            </span>
            <span className="badge__name">{a.name}</span>
            <span className="badge__desc">{a.description}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
