import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import type { Country } from '@/types';
import { isSpeedRunAllowed } from './age';
import {
  LETTER_RULES,
  buildResolver,
  countriesForLetter,
  judgeGuess,
  pickLetter,
  type LetterRule,
} from './countryLetters';

type Phase = 'ready' | 'running' | 'done';

/** Country Letters — a Speed Run: name as many countries as you can that start with
 *  (or contain) a given letter before the clock runs out. Ages 8+. */
export function CountryLettersScreen() {
  const { profile } = useProfile();
  const progress = useProgress();
  const allowed = isSpeedRunAllowed(profile?.ageBand);

  const [rule, setRule] = useState<LetterRule>('starts');
  const [seed, setSeed] = useState(() => String(Date.now()));
  const [phase, setPhase] = useState<Phase>('ready');
  const [named, setNamed] = useState<Country[]>([]);
  const [timeLeft, setTimeLeft] = useState(LETTER_RULES.starts.seconds);
  const [text, setText] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const recordedRef = useRef(false);

  const meta = LETTER_RULES[rule];
  const resolver = useMemo(() => buildResolver(), []);
  const letter = useMemo(() => pickLetter(rule, seed), [rule, seed]);
  const answerSet = useMemo(
    () => (letter ? countriesForLetter(letter, rule) : []),
    [letter, rule]
  );
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
    setTimeLeft(LETTER_RULES[rule].seconds);
    setPhase('running');
  }, [rule]);

  const submit = useCallback(() => {
    if (phase !== 'running' || !letter) return;
    const guess = text.trim();
    if (!guess) return;
    const result = judgeGuess(guess, letter, rule, namedIds, resolver);
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
      case 'wrong-letter':
        setMessage({ ok: false, text: `${result.country.name} doesn’t ${meta.verb} ${letter.toUpperCase()}` });
        break;
      default:
        setMessage({ ok: false, text: `Hmm — not a country we know` });
    }
  }, [phase, letter, rule, text, named, namedIds, answerSet.length, resolver, meta.verb]);

  if (!allowed) {
    return (
      <Screen title="Country Letters" subtitle="An extra-fast challenge.">
        <p className="empty-state">Speed Run is for explorers aged 8 and up.</p>
        <Link to={paths.play} className="button">
          Back to games
        </Link>
      </Screen>
    );
  }

  if (phase === 'ready') {
    return (
      <Screen title="Country Letters" subtitle="Name as many countries as you can!">
        <p className="speedrun-intro">
          You’ll get a letter — type every country you can think of before time runs out.
        </p>
        <div className="letter-modes" role="group" aria-label="Choose a challenge">
          <button
            type="button"
            className={rule === 'starts' ? 'letter-mode letter-mode--on' : 'letter-mode'}
            aria-pressed={rule === 'starts'}
            onClick={() => setRule('starts')}
          >
            <span className="letter-mode__title">Starts with…</span>
            <span className="letter-mode__sub">Countries that begin with the letter · 45s</span>
          </button>
          <button
            type="button"
            className={rule === 'contains' ? 'letter-mode letter-mode--on' : 'letter-mode'}
            aria-pressed={rule === 'contains'}
            onClick={() => setRule('contains')}
          >
            <span className="letter-mode__title">Contains…</span>
            <span className="letter-mode__sub">Countries with the letter anywhere · 60s</span>
          </button>
        </div>
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
      <Screen title="Time!" subtitle={`${meta.title} “${letter?.toUpperCase() ?? ''}” complete`}>
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
    <Screen title="Country Letters">
      <div className="speedrun-bar">
        <span className={`speedrun-timer${timeLeft <= 5 ? ' speedrun-timer--low' : ''}`}>
          ⏱️ {timeLeft}s
        </span>
        <span className="speedrun-score">✅ {named.length}</span>
      </div>

      <div className="letter-prompt" aria-hidden="true">
        {letter?.toUpperCase()}
      </div>
      <p className="quiz-prompt">
        Countries that {rule === 'starts' ? 'start with' : 'contain the letter'}{' '}
        <strong>{letter?.toUpperCase()}</strong>
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
