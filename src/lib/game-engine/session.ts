import type { Question } from '@/types';
import { scoreAnswer, type AnswerResult } from './scoring';

/**
 * Quiz session state machine (PRD §6, §11 FR-011).
 *
 * Immutable and pure: each transition returns a new session. The flow is
 * question → answer (records + returns feedback) → advance → next question,
 * so the UI can show the explanation before moving on (PRD US-10). Progress
 * persistence and mastery updates are handled by the caller via applyAnswer.
 */

export interface RecordedAnswer {
  questionId: string;
  chosen: string;
  correct: boolean;
}

export interface QuizSession {
  questions: Question[];
  /** Index of the current question. Equals questions.length when finished. */
  index: number;
  answers: RecordedAnswer[];
  correctCount: number;
  finished: boolean;
}

export function createSession(questions: readonly Question[]): QuizSession {
  return {
    questions: [...questions],
    index: 0,
    answers: [],
    correctCount: 0,
    finished: questions.length === 0,
  };
}

export function currentQuestion(session: QuizSession): Question | undefined {
  return session.questions[session.index];
}

/** True once the current question has been answered (its answer is recorded). */
export function isCurrentAnswered(session: QuizSession): boolean {
  const q = currentQuestion(session);
  if (!q) return false;
  return session.answers.some((a) => a.questionId === q.id);
}

/**
 * Answer the current question. Records the outcome and returns the feedback,
 * but does not advance — call `advance` after showing the explanation. Answering
 * the same question twice is a no-op that returns the original result.
 */
export function answerCurrent(
  session: QuizSession,
  chosen: string
): { session: QuizSession; result: AnswerResult } {
  const question = currentQuestion(session);
  if (!question) {
    return {
      session,
      result: { correct: false, correctAnswer: '', explanation: '' },
    };
  }

  const existing = session.answers.find((a) => a.questionId === question.id);
  if (existing) {
    return { session, result: scoreAnswer(question, existing.chosen) };
  }

  const result = scoreAnswer(question, chosen);
  const next: QuizSession = {
    ...session,
    answers: [...session.answers, { questionId: question.id, chosen, correct: result.correct }],
    correctCount: session.correctCount + (result.correct ? 1 : 0),
  };
  return { session: next, result };
}

/** Move to the next question, marking the session finished when past the end. */
export function advance(session: QuizSession): QuizSession {
  const nextIndex = Math.min(session.index + 1, session.questions.length);
  return { ...session, index: nextIndex, finished: nextIndex >= session.questions.length };
}

export interface SessionSummary {
  total: number;
  correct: number;
  /** 0–1 accuracy; 0 for an empty session. */
  accuracy: number;
}

export function sessionSummary(session: QuizSession): SessionSummary {
  const total = session.answers.length;
  return {
    total,
    correct: session.correctCount,
    accuracy: total === 0 ? 0 : session.correctCount / total,
  };
}
