import { Link, useParams } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { getGameModeMeta } from './gameModes';

/**
 * S06 Quiz / S07 Map Challenge — placeholder. The playable question engine and
 * per-mode UIs are built in Phases 3–4. This stub validates routing by mode and
 * the presence of an accessible alternative for map-based games (PRD §7.4).
 */
export function GameScreen() {
  const { mode } = useParams<{ mode: string }>();
  const meta = mode ? getGameModeMeta(mode) : undefined;

  if (!meta) {
    return (
      <Screen title="Game not found">
        <Link to={paths.play} className="button">
          Back to games
        </Link>
      </Screen>
    );
  }

  return (
    <Screen title={meta.title} subtitle={meta.blurb}>
      <div className="game-placeholder">
        <p>This game becomes playable in Phase 4.</p>
        {meta.mapBased ? (
          <p className="game-placeholder__note">
            This is a map game — an accessible non-map way to answer will be provided.
          </p>
        ) : null}
      </div>
      <Link to={paths.play} className="button">
        Back to games
      </Link>
    </Screen>
  );
}
