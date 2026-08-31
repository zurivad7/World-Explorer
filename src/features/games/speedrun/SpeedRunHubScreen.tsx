import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';
import { isSpeedRunAllowed } from './age';
import { SPEED_RUN_MODES } from './speedRunModes';

/** Speed Run hub — three timed challenges, for ages 8+ (PRD age bands §7). */
export function SpeedRunHubScreen() {
  const { profile } = useProfile();

  if (!isSpeedRunAllowed(profile?.ageBand)) {
    return (
      <Screen title="Speed Run" subtitle="An extra-fast challenge.">
        <p className="empty-state">
          Speed Run is for explorers aged 8 and up. You can change the age in Settings.
        </p>
        <Link to={paths.play} className="button">
          Back to games
        </Link>
      </Screen>
    );
  }

  return (
    <Screen title="Speed Run" subtitle="How many can you get before the clock runs out?">
      <div className="card-grid">
        {SPEED_RUN_MODES.map((mode) => (
          <Link key={mode.kind} to={paths.speedRunGame(mode.kind)} className="game-card game-card--speed">
            <span className="game-card__icon" aria-hidden="true">
              {mode.icon}
            </span>
            <span className="game-card__title">{mode.title}</span>
            <span className="game-card__blurb">{mode.blurb}</span>
          </Link>
        ))}
        <Link to={paths.speedRunLetters} className="game-card game-card--speed">
          <span className="game-card__icon" aria-hidden="true">
            🔤
          </span>
          <span className="game-card__title">Country Letters</span>
          <span className="game-card__blurb">
            Name every country that starts with — or contains — a letter.
          </span>
        </Link>
      </div>
      <Link to={paths.play} className="button">
        Back to games
      </Link>
    </Screen>
  );
}
