import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import { localDateKey } from '@/lib/game-engine';
import { PILLAR_META, gameModesForPillar } from './gameModes';
import { isSpeedRunAllowed } from './speedrun/age';

/** S05 Game Hub — six game cards + daily challenge + Speed Run (PRD §13). */
export function GameHubScreen() {
  const { profile } = useProfile();
  const { stats } = useProgress();
  const dailyDone = stats.lastDailyDate === localDateKey();
  const showSpeedRun = isSpeedRunAllowed(profile?.ageBand);

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

      {showSpeedRun ? (
        <Link to={paths.speedRun} className="daily-card daily-card--speed">
          <span className="daily-card__icon" aria-hidden="true">
            ⚡
          </span>
          <span className="daily-card__text">
            <span className="daily-card__title">Speed Run</span>
            <span className="daily-card__blurb">
              Beat the clock — flags, find-it and typed capitals in 30 seconds. For ages 8+.
            </span>
          </span>
        </Link>
      ) : null}

      {PILLAR_META.map((pillar) => {
        const modes = gameModesForPillar(pillar.pillar);
        if (modes.length === 0) return null;
        return (
          <section key={pillar.pillar} className="pillar" aria-label={pillar.title}>
            <h2 className="pillar__heading">
              <span className="pillar__icon" aria-hidden="true">
                {pillar.icon}
              </span>
              <span className="pillar__title">{pillar.title}</span>
              <span className="pillar__blurb">{pillar.blurb}</span>
            </h2>
            <div className="card-grid">
              {modes.map((meta) => (
                <Link key={meta.mode} to={paths.game(meta.mode)} className="game-card">
                  <span className="game-card__icon" aria-hidden="true">
                    {meta.icon}
                  </span>
                  <span className="game-card__title">{meta.title}</span>
                  <span className="game-card__blurb">{meta.blurb}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </Screen>
  );
}
