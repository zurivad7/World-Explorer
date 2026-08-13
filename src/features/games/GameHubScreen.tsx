import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { GAME_MODE_META } from './gameModes';

/** S05 Game Hub — six game cards + daily challenge (PRD §13). */
export function GameHubScreen() {
  return (
    <Screen title="Choose a game" subtitle="Pick a challenge and start exploring.">
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
