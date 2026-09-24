import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import type { Country } from '@/types';
import { isSpeedRunAllowed } from './age';
import {
  buildResolver,
  countriesForLength,
  countryLetterCount,
  judgeLengthGuess,
  pickLength,
} from './letterCount';

type Phase = 'ready' | 'running' | 'done';

/** How long a Letter Count Blitz lasts — typing many names takes a full minute. */
const LETTER_COUNT_SECONDS = 60;

/** Letter Count Blitz — a Speed Run: name as many one-word countries as you can with an
 *  exact number of letters (5 → India, China, Niger) before the clock runs out. Ages 8+. */
export function LetterCountScreen() {
  const { profile } = useProfile();
  const progress = useProgress();
  const allowed = isSpeedRunAllowed(profile?.ageBand);

  const [seed, setSeed] = useState(() => String(Date.now()));
  const [phase, setPhase] = useState<Phase>('ready');
  const [named, setNamed] = useState<Country[]>([]);
  const [timeLeft, setTimeLeft] = useState(LETTER_COUNT_SECONDS);
  const [text, setText] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const recordedRef = useRef(false);

  const resolver = useMemo(() => buildResolver(), []);
  const length = useMemo(() => pickLength(seed), [seed]);
  const answerSet = useMemo(() => (length ? countriesForLength(length) : []), [length]);
  const namedIds = useMemo(() => new Set(named.map((c) => c.id)), [named]);

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

  // Record the finished run once (counter + recent activity).
  useEffect(() => {
    if (phase !== 'done' || recordedRef.current) return;
    recordedRef.current = true;
    void progress.recordGameCompleted('speedrun', named.length, answerSet.length);
  }, [phase, named.length, answerSet.length, progress]);

  const start = useCallback(() => {
    recordedRef.current = false;
    setSeed(String(Date.now()));
    setNamed([]);
    setText('');
    setMessage(null);
    setTimeLeft(LETTER_COUNT_SECONDS);
    setPhase('running');
  }, []);

  const submit = useCallback(() => {
    if (phase !== 'running' || !length) return;
    const guess = text.trim();
    if (!guess) return;
    const result = judgeLengthGuess(guess, length, namedIds, resolver);
    setText('');
    switch (result.status) {
      case 'correct': {
        const next = [result.country, ...named];
        setNamed(next);
        setMessage({ ok: true, text: `✓ ${result.country.name}` });
        // Cleared the whole set — end early with a win rather than idle time.
        if (next.length >= answerSet.length) setPhase('done');
        break;
      }
      case 'duplicate':
        setMessage({ ok: false, text: `Already got ${result.country.name}` });
        break;
      case 'wrong-length':
        setMessage({
          ok: false,
          text:
            result.reason === 'multi-word'
              ? `${result.country.name} isn’t a one-word name`
              : `${result.country.name} has ${countLettersLabel(result.country)}, not ${length}`,
        });
        break;
      default:
        setMessage({ ok: false, text: `Hmm — not a country we know` });
    }
  }, [phase, length, text, named, namedIds, answerSet.length, resolver]);

  if (!allowed) {
    return (
      <Screen title="Letter Count Blitz" subtitle="An extra-fast challenge.">
        <p className="empty-state">Speed Run is for explorers aged 8 and up.</p>
        <Link to={paths.play} className="button">
          Back to games
        </Link>
      </Screen>
    );
  }

  if (phase === 'ready') {
    return (
      <Screen title="Letter Count Blitz" subtitle="Name as many countries as you can!">
        <p className="speedrun-intro">
          You’ll get a number — type every <strong>one-word</strong> country whose name has
          exactly that many letters before time runs out. One minute on the clock.
        </p>
        <button type="button" className="button button--primary" onClick={start}>
          Start the clock
        </button>
        <Link to={paths.speedRun} className="button">
          Back
        </Link>
      </Screen>
    );
  }

  if (phase === 'done') {
    const missed = answerSet.filter((c) => !namedIds.has(c.id));
    return (
      <Screen title="Time!" subtitle={`${length ?? ''}-letter countries complete`}>
        <div className="quiz-summary">
          <p className="quiz-summary__score">You named {named.length}!</p>
          <p className="quiz-summary__pct">
            {named.length}/{answerSet.length} countries
          </p>
        </div>
        {missed.length > 0 ? (
          <>
            <h2 className="section-heading">Ones you missed</h2>
            <ul className="chip-list">
              {missed.map((c) => (
                <li key={c.id}>
                  <span className="chip">{c.name}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="speedrun-intro">🎉 You got them all!</p>
        )}
        <div className="quiz-actions">
          <button type="button" className="button button--primary" onClick={start}>
            Play again
          </button>
          <Link to={paths.speedRun} className="button">
            More Speed Runs
          </Link>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Letter Count Blitz">
      <div className="speedrun-bar">
        <span className={`speedrun-timer${timeLeft <= 5 ? ' speedrun-timer--low' : ''}`}>
          ⏱️ {timeLeft}s
        </span>
        <span className="speedrun-score">✅ {named.length}</span>
      </div>

      <div className="letter-prompt" aria-hidden="true">
        {length}
      </div>
      <p className="quiz-prompt">
        One-word countries with exactly <strong>{length}</strong> letters
      </p>

      <form
        className="speedrun-typing"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          className="speedrun-input"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          aria-label="Type a country name"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button type="submit" className="button button--primary">
          Add
        </button>
      </form>

      {message ? (
        <div
          className={message.ok ? 'speedrun-feedback speedrun-feedback--ok' : 'speedrun-feedback speedrun-feedback--no'}
          role="status"
        >
          {message.text}
        </div>
      ) : null}

      {named.length > 0 ? (
        <ul className="chip-list letter-named" aria-label="Countries you have named">
          {named.map((c) => (
            <li key={c.id}>
              <span className="chip chip--good">{c.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Screen>
  );
}

/** "6 letters" / "1 letter" — a small helper so wrong-length feedback reads naturally. */
function countLettersLabel(country: Country): string {
  const n = countryLetterCount(country);
  return `${n} letter${n === 1 ? '' : 's'}`;
}
