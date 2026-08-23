import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import { assetUrl } from '@/lib/assets';
import { answerMatches } from '@/lib/game-engine';
import type { Country, Question } from '@/types';
import { LazyWorldMap } from '@/features/map/LazyWorldMap';
import { getSpeedRunMode, speedRunPool, SPEED_RUN_SECONDS } from './speedRunModes';
import { choiceOptions, shuffledDeck } from './speedRunDeck';
import { isSpeedRunAllowed } from './age';

type Phase = 'ready' | 'running' | 'done';
interface Feedback {
  ok: boolean;
  answer: string;
  tappedId?: string;
  targetId: string;
}

/** The label the player is trying to produce for a given item. */
function answerLabel(kind: string, country: Country): string {
  return kind === 'capital' ? country.capital : country.name;
}

/** S07b Speed Run — a 30-second blitz (flags / find-it / typed capitals), ages 8+. */
export function SpeedRunScreen() {
  const { kind } = useParams<{ kind: string }>();
  const { profile } = useProfile();
  const progress = useProgress();
  const mode = kind ? getSpeedRunMode(kind) : undefined;
  const allowed = isSpeedRunAllowed(profile?.ageBand);

  const [seed, setSeed] = useState(() => String(Date.now()));
  const pool = useMemo(() => (mode ? speedRunPool(mode.kind) : []), [mode]);
  const deck = useMemo(() => shuffledDeck(pool, seed), [pool, seed]);

  const [phase, setPhase] = useState<Phase>('ready');
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SPEED_RUN_SECONDS);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [text, setText] = useState('');
  const recordedRef = useRef(false);
  const advanceRef = useRef<number | null>(null);

  const current = deck.length > 0 ? deck[index % deck.length] : undefined;

  // Countdown while running.
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Record the finished blitz once (counter + recent activity).
  useEffect(() => {
    if (phase !== 'done' || recordedRef.current) return;
    recordedRef.current = true;
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    void progress.recordGameCompleted('speedrun', correct, attempted);
  }, [phase, correct, attempted, progress]);

  // Clear any pending advance on unmount.
  useEffect(() => () => void (advanceRef.current && window.clearTimeout(advanceRef.current)), []);

  const answer = useCallback(
    (isCorrect: boolean, tappedId?: string) => {
      if (phase !== 'running' || feedback || !current || !mode) return;
      setAttempted((a) => a + 1);
      if (isCorrect) setCorrect((c) => c + 1);
      // Update mastery/discovery via the same path as the normal quiz. Only the
      // topic, difficulty and countryId are read, so a minimal record is enough.
      const synthetic = {
        topic: mode.topic,
        difficulty: 'medium',
        countryId: current.id,
      } as unknown as Question;
      void progress.recordAnswer(synthetic, isCorrect);
      setFeedback({
        ok: isCorrect,
        answer: answerLabel(mode.kind, current),
        targetId: current.id,
        ...(tappedId ? { tappedId } : {}),
      });
      advanceRef.current = window.setTimeout(
        () => {
          setFeedback(null);
          setText('');
          setIndex((i) => i + 1);
        },
        isCorrect ? 350 : 900
      );
    },
    [phase, feedback, current, mode, progress]
  );

  const restart = useCallback(() => {
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    recordedRef.current = false;
    setSeed(String(Date.now()));
    setIndex(0);
    setTimeLeft(SPEED_RUN_SECONDS);
    setCorrect(0);
    setAttempted(0);
    setFeedback(null);
    setText('');
    setPhase('running');
  }, []);

  if (!mode) {
    return (
      <Screen title="Speed Run not found">
        <Link to={paths.speedRun} className="button">
          Back to Speed Run
        </Link>
      </Screen>
    );
  }

  if (!allowed) {
    return (
      <Screen title="Speed Run" subtitle="An extra-fast challenge.">
        <p className="empty-state">Speed Run is for explorers aged 8 and up.</p>
        <Link to={paths.play} className="button">
          Back to games
        </Link>
      </Screen>
    );
  }

  if (phase === 'ready') {
    return (
      <Screen title={mode.title} subtitle="Ready? You have 30 seconds.">
        <p className="speedrun-intro">{mode.blurb}</p>
        <button type="button" className="button button--primary" onClick={restart}>
          Start the clock
        </button>
        <Link to={paths.speedRun} className="button">
          Back
        </Link>
      </Screen>
    );
  }

  if (phase === 'done') {
    return (
      <Screen title="Time!" subtitle={`${mode.title} complete`}>
        <div className="quiz-summary">
          <p className="quiz-summary__score">You got {correct} right!</p>
          <p className="quiz-summary__pct">
            {correct}/{attempted || 0}
          </p>
        </div>
        <div className="quiz-actions">
          <button type="button" className="button button--primary" onClick={restart}>
            Play again
          </button>
          <Link to={paths.speedRun} className="button">
            More Speed Runs
          </Link>
        </div>
      </Screen>
    );
  }

  if (!current) {
    return (
      <Screen title={mode.title}>
        <p className="empty-state">No questions available for this challenge.</p>
      </Screen>
    );
  }

  const options = mode.kind === 'flag' ? choiceOptions(current, pool, `${seed}-${index}`) : [];
  // Highlight state for the Find It map during feedback (show target + what was tapped).
  const mapHighlight =
    mode.kind === 'find-it' && feedback
      ? {
          highlightedIds: new Set([feedback.targetId]),
          ...(feedback.tappedId && !feedback.ok ? { selectedId: feedback.tappedId } : {}),
        }
      : {};

  return (
    <Screen title={mode.title}>
      <div className="speedrun-bar">
        <span className={`speedrun-timer${timeLeft <= 5 ? ' speedrun-timer--low' : ''}`}>
          ⏱️ {timeLeft}s
        </span>
        <span className="speedrun-score">✅ {correct}</span>
      </div>

      {mode.kind === 'flag' ? (
        <>
          <img
            className="quiz-prompt-flag"
            src={assetUrl(current.flagAsset)}
            alt="Flag to identify"
            width={160}
            height={120}
          />
          <p className="quiz-prompt">Which country?</p>
          <div className="quiz-options">
            {options.map((c) => (
              <button
                key={c.id}
                type="button"
                className={
                  feedback
                    ? c.id === current.id
                      ? 'quiz-option quiz-option--correct'
                      : c.id === feedback.tappedId
                        ? 'quiz-option quiz-option--wrong'
                        : 'quiz-option quiz-option--dim'
                    : 'quiz-option'
                }
                disabled={Boolean(feedback)}
                onClick={() => answer(c.id === current.id, c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {mode.kind === 'find-it' ? (
        <>
          <p className="quiz-prompt">
            Find <strong>{current.name}</strong>
          </p>
          <LazyWorldMap
            ariaLabel={`Find ${current.name} on the map`}
            onSelectCountry={(id) => answer(id === current.id, id)}
            className="world-map--explore"
            {...mapHighlight}
          />
        </>
      ) : null}

      {mode.kind === 'capital' ? (
        <>
          <p className="quiz-prompt">
            What is the capital of <strong>{current.name}</strong>?
          </p>
          <form
            className="speedrun-typing"
            onSubmit={(e) => {
              e.preventDefault();
              if (!feedback) answer(answerMatches(text, current.capital));
            }}
          >
            <input
              className="speedrun-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
              aria-label={`Type the capital of ${current.name}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={Boolean(feedback)}
              autoFocus
            />
            <button type="submit" className="button button--primary" disabled={Boolean(feedback)}>
              Enter
            </button>
          </form>
        </>
      ) : null}

      {feedback ? (
        <div
          className={feedback.ok ? 'speedrun-feedback speedrun-feedback--ok' : 'speedrun-feedback speedrun-feedback--no'}
          role="status"
        >
          {feedback.ok ? '✅ Yes!' : `❌ It was ${feedback.answer}`}
        </div>
      ) : null}
    </Screen>
  );
}
