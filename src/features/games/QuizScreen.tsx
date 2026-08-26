import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import { assetUrl } from '@/lib/assets';
import { getCountryById } from '@/data';
import { getQuestionsForMode, questions as allQuestions } from '@/data/questions';
import {
  advance,
  answerCurrent,
  createSession,
  currentQuestion,
  dailyChallengeQuestions,
  localDateKey,
  seededShuffle,
  selectQuestions,
  sessionSummary,
  type AnswerResult,
  type QuizSession,
} from '@/lib/game-engine';
import type { Question } from '@/types';
import { getGameModeMeta } from './gameModes';
import {
  COLOUR_HEX,
  DEFAULT_SESSION_LENGTH,
  isMapQuestion,
  optionKind,
  promptShowsFlag,
  promptShowsShape,
} from './quizConfig';
import { LazyWorldMap } from '@/features/map/LazyWorldMap';
import { CountrySilhouette } from '@/components/CountrySilhouette';

const DAILY = 'daily';

function labelForOption(question: Question, option: string): string {
  const kind = optionKind(question);
  if (kind === 'country-name' || kind === 'country-flag') {
    return getCountryById(option)?.name ?? option;
  }
  if (kind === 'colours') return option.split('-').join(', ');
  return option;
}

export function QuizScreen() {
  const { mode, countryId } = useParams<{ mode: string; countryId: string }>();
  const { profile } = useProfile();
  const progress = useProgress();
  const ageBand = profile?.ageBand ?? '8-10';

  // A per-country quiz (/play/country/:countryId) mixes every mode's questions
  // for one country; otherwise mode picks a single game (or the daily challenge).
  const country = countryId ? getCountryById(countryId) : undefined;
  const isCountry = Boolean(countryId);
  const isDaily = mode === DAILY;
  const meta = mode && !isDaily ? getGameModeMeta(mode) : undefined;
  const valid = isCountry ? Boolean(country) : isDaily || Boolean(meta);

  const buildQuestions = useCallback((): Question[] => {
    if (isCountry) {
      if (!country) return [];
      // Every active question about this country, in a fresh order each play.
      const forCountry = allQuestions.filter((q) => q.active && q.countryId === country.id);
      return seededShuffle(forCountry, `country-${country.id}-${Date.now()}`).slice(
        0,
        DEFAULT_SESSION_LENGTH
      );
    }
    if (isDaily) return dailyChallengeQuestions(allQuestions, localDateKey(), DEFAULT_SESSION_LENGTH);
    if (!meta) return [];
    // Adaptive selection reads the player's stored mastery (persisted across sessions).
    return selectQuestions(
      getQuestionsForMode(meta.mode),
      { ageBand, progress: progress.progressByKey, seed: `${mode}-${Date.now()}` },
      DEFAULT_SESSION_LENGTH
    );
  }, [isCountry, country, isDaily, meta, ageBand, mode, progress.progressByKey]);

  const [session, setSession] = useState<QuizSession>(() => createSession([]));
  const [built, setBuilt] = useState(false);
  const [feedback, setFeedback] = useState<{ chosen: string; result: AnswerResult } | null>(null);
  const recordedRef = useRef(false);

  // Build the session once the player's progress has loaded (so selection is adaptive).
  useEffect(() => {
    if (progress.loading || built) return;
    setSession(createSession(buildQuestions()));
    setBuilt(true);
  }, [progress.loading, built, buildQuestions]);

  // Record the completed session once (counter, recent activity, daily stamp).
  useEffect(() => {
    if (!session.finished || session.questions.length === 0 || recordedRef.current) return;
    recordedRef.current = true;
    const summary = sessionSummary(session);
    const completedMode = isCountry ? 'country' : isDaily ? 'daily' : meta!.mode;
    void progress.recordGameCompleted(completedMode, summary.correct, summary.total);
  }, [session, isCountry, isDaily, meta, progress]);

  const question = currentQuestion(session);

  const choose = useCallback(
    (option: string) => {
      if (feedback || !question) return;
      const { session: next, result } = answerCurrent(session, option);
      setSession(next);
      setFeedback({ chosen: option, result });
      void progress.recordAnswer(question, result.correct);
    },
    [feedback, question, session, progress]
  );

  const goNext = useCallback(() => {
    setSession((s) => advance(s));
    setFeedback(null);
  }, []);

  const playAgain = useCallback(() => {
    recordedRef.current = false;
    setSession(createSession(buildQuestions()));
    setFeedback(null);
  }, [buildQuestions]);

  if (!valid) {
    return (
      <Screen title="Game not found">
        <Link to={paths.play} className="button">
          Back to games
        </Link>
      </Screen>
    );
  }

  const title = isCountry
    ? `${country?.name ?? 'Country'} Quiz`
    : isDaily
      ? 'Daily Challenge'
      : (meta?.title ?? 'Quiz');

  // A country quiz returns to that country's page; everything else to the Game Hub.
  const backTo = isCountry && country ? paths.country(country.id) : paths.play;
  const backLabel = isCountry && country ? `Back to ${country.name}` : 'Back to games';

  if (!built) {
    return (
      <Screen title={title}>
        <p className="loading">Getting your questions ready…</p>
      </Screen>
    );
  }

  if (session.questions.length === 0) {
    return (
      <Screen title={title}>
        <p className="empty-state">No questions available yet for this game.</p>
        <Link to={backTo} className="button">
          {backLabel}
        </Link>
      </Screen>
    );
  }

  if (session.finished) {
    const summary = sessionSummary(session);
    const pct = Math.round(summary.accuracy * 100);
    return (
      <Screen title="Great exploring!" subtitle={`${title} complete`}>
        <div className="quiz-summary">
          <p className="quiz-summary__score">
            You got {summary.correct} out of {summary.total}!
          </p>
          <p className="quiz-summary__pct">{pct}%</p>
        </div>
        <div className="quiz-actions">
          <button type="button" className="button button--primary" onClick={playAgain}>
            Play again
          </button>
          <Link to={backTo} className="button">
            {backLabel}
          </Link>
        </div>
      </Screen>
    );
  }

  if (!question) return null;

  const total = session.questions.length;
  const number = session.index + 1;
  const kind = optionKind(question);
  const correct = question.correctAnswer;

  function optionClass(option: string): string {
    if (!feedback) return 'quiz-option';
    if (option === correct) return 'quiz-option quiz-option--correct';
    if (option === feedback.chosen) return 'quiz-option quiz-option--wrong';
    return 'quiz-option quiz-option--dim';
  }

  return (
    <Screen title={title}>
      <div className="quiz-progress" aria-label={`Question ${number} of ${total}`}>
        <div className="quiz-progress__bar" style={{ width: `${(number / total) * 100}%` }} />
      </div>
      <p className="quiz-progress__label">
        Question {number} of {total}
      </p>

      {promptShowsFlag(question) && question.countryId ? (
        <img
          className="quiz-prompt-flag"
          src={assetUrl(getCountryById(question.countryId)?.flagAsset ?? '')}
          alt="Flag to identify"
          width={160}
          height={120}
        />
      ) : null}

      {promptShowsShape(question) && question.countryId ? (
        <CountrySilhouette id={question.countryId} className="quiz-prompt-shape" />
      ) : null}

      <p className="quiz-prompt">{question.prompt}</p>

      {isMapQuestion(question) ? (
        <>
          <LazyWorldMap
            ariaLabel={question.prompt}
            onSelectCountry={(id) => choose(id)}
            className="world-map--explore"
            {...(feedback
              ? { selectedId: feedback.chosen, highlightedIds: new Set([correct]) }
              : {})}
          />
          <p className="map-hint">Tap the country on the map, or use the buttons below.</p>
        </>
      ) : null}

      <div className={kind === 'country-flag' ? 'quiz-options quiz-options--flags' : 'quiz-options'}>
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            className={optionClass(option)}
            disabled={Boolean(feedback)}
            aria-label={labelForOption(question, option)}
            onClick={() => choose(option)}
          >
            {kind === 'country-flag' ? (
              <img
                src={assetUrl(getCountryById(option)?.flagAsset ?? '')}
                alt={labelForOption(question, option)}
                width={96}
                height={72}
              />
            ) : kind === 'colours' ? (
              <span className="swatch-row" aria-hidden="true">
                {option.split('-').map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="swatch"
                    style={{ background: COLOUR_HEX[c] ?? c }}
                  />
                ))}
              </span>
            ) : (
              labelForOption(question, option)
            )}
          </button>
        ))}
      </div>

      {feedback ? (
        <div
          className={feedback.result.correct ? 'quiz-feedback quiz-feedback--ok' : 'quiz-feedback quiz-feedback--no'}
          role="status"
        >
          <p className="quiz-feedback__headline">
            {feedback.result.correct ? '✅ Correct!' : '💡 Good try!'}
          </p>
          <p className="quiz-feedback__explanation">{feedback.result.explanation}</p>
          <button type="button" className="button button--primary" onClick={goNext}>
            {number >= total ? 'See results' : 'Next'}
          </button>
        </div>
      ) : null}
    </Screen>
  );
}
