import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProgress } from '@/app/providers/ProgressProvider';
import { localDateKey } from '@/lib/game-engine';
import { GAME_MODE_META } from './gameModes';

/** S05 Game Hub — six game cards + daily challenge (PRD §13). */
export function GameHubScreen() {
  const { stats } = useProgress();
  const dailyDone = stats.lastDailyDate === localDateKey();

  return (
    <Screen title="Choose a game" subtitle="Pick a challenge and start exploring.">
      <Link to={paths.dailyChallenge} className="daily-card">
        <span className="daily-card__icon" aria-hidden="true">
          ⭐
        </span>
        <span className="daily-card__text">
          <span className="daily-card__title">Daily Challenge</span>
          <span className="daily-card__blurb">
            {dailyDone ? '✓ Done today — play again anytime!' : 'A fresh mix of questions every day.'}
          </span>
        </span>
      </Link>

      <div className="card-grid">
        {GAME_MODE_META.map((meta) => (
          <Link key={meta.mode} to={paths.game(meta.mode)} className="game-card">
            <span className="game-card__icon" aria-hidden="true">
              {meta.icon}
            </span>
            <span className="game-card__title">{meta.title}</span>
            <span className="game-card__blurb">{meta.blurb}</span>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
