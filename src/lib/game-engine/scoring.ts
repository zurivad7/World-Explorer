import type { Progress, Question } from '@/types';
import { updateMastery } from './mastery';

/**
 * Answer validation and progress update (PRD §11 FR-011).
 *
 * Pure functions only — no storage, no React. The storage layer is responsible
 * for persisting the returned Progress.
 */

export interface AnswerResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

/** Validate a chosen answer against a question. */
export function scoreAnswer(question: Question, chosenAnswer: string): AnswerResult {
  return {
    correct: chosenAnswer === question.correctAnswer,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  };
}

/** Apply an answer outcome to a Progress record, returning a new record. */
export function applyAnswer(
  progress: Progress,
  correct: boolean,
  difficulty: Question['difficulty'],
  now: string = new Date().toISOString()
): Progress {
  return {
    ...progress,
    attempts: progress.attempts + 1,
    correct: progress.correct + (correct ? 1 : 0),
    masteryScore: updateMastery(progress.masteryScore, correct, difficulty),
    lastPlayedAt: now,
  };
}
