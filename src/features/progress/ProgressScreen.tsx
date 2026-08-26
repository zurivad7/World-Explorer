import { Screen } from '@/components/Screen';
import { useProgress } from '@/app/providers/ProgressProvider';
import { GAME_MODE_META } from '@/features/games/gameModes';
import { MASTERED_THRESHOLD, topicKey } from '@/lib/game-engine';
import type { GameMode, Topic } from '@/types';

const TOPIC_LABELS: Record<Topic, string> = {
  flags: 'Flags',
  capitals: 'Capitals',
  continents: 'Continents',
  location: 'Finding on the map',
  clues: 'Geography clues',
  facts: 'Good to know',
  shapes: 'Country shapes',
};

const TOPICS = Object.keys(TOPIC_LABELS) as Topic[];

function modeLabel(mode: GameMode | 'daily' | 'country' | 'speedrun'): string {
  if (mode === 'daily') return 'Daily Challenge';
  if (mode === 'country') return 'Country Quiz';
  if (mode === 'speedrun') return 'Speed Run';
  return GAME_MODE_META.find((m) => m.mode === mode)?.title ?? mode;
}

/** S10 Progress — topic strengths, what to practise, recent activity (PRD §13). */
export function ProgressScreen() {
  const { masteryFor, stats, progressByKey } = useProgress();

  const topics = TOPICS.map((t) => ({ topic: t, mastery: masteryFor(topicKey(t)) }));
  const played = topics.filter((t) => progressByKey.has(topicKey(t.topic)));
  const practise = played.filter((t) => t.mastery < MASTERED_THRESHOLD).sort((a, b) => a.mastery - b.mastery);

  return (
    <Screen title="My Progress" subtitle="See what you're great at and what to practise next.">
      {played.length === 0 ? (
        <p className="empty-state">Play some games and your strengths and recent activity appear here.</p>
      ) : (
        <>
          <h2 className="section-heading">Topic strengths</h2>
          <ul className="continent-progress">
            {topics.map((t) => (
              <li key={t.topic} className="continent-progress__row">
                <div className="continent-progress__head">
                  <span>{TOPIC_LABELS[t.topic]}</span>
                  <span className="continent-progress__count">
                    {t.mastery >= MASTERED_THRESHOLD ? '⭐ Mastered' : `${Math.round(t.mastery)}%`}
                  </span>
                </div>
                <div className="mini-bar">
                  <div className="mini-bar__fill" style={{ width: `${Math.round(t.mastery)}%` }} />
                </div>
              </li>
            ))}
          </ul>

          {practise.length > 0 ? (
            <>
              <h2 className="section-heading">Practise next</h2>
              <div className="filter-row">
                {practise.slice(0, 3).map((t) => (
                  <span key={t.topic} className="chip">
                    {TOPIC_LABELS[t.topic]}
                  </span>
                ))}
              </div>
            </>
          ) : null}

          {stats.recentActivity.length > 0 ? (
            <>
              <h2 className="section-heading">Recent activity</h2>
              <ul className="continent-progress">
                {stats.recentActivity.map((a, i) => (
                  <li key={`${a.at}-${i}`} className="continent-progress__row">
                    <div className="continent-progress__head">
                      <span>{modeLabel(a.mode)}</span>
                      <span className="continent-progress__count">
                        {a.correct} / {a.total}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
