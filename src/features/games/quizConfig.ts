import type { Question } from '@/types';

/**
 * Per-question rendering rules for the quiz UI. Kept separate from the component
 * so the (pure) decisions are easy to read and test. The question *data* is
 * generated in src/data/generate.ts; here we only decide how each option should
 * be presented, based on the question type and its id convention.
 */

/** How the current question's options should be rendered. */
export type OptionKind = 'country-name' | 'country-flag' | 'text' | 'colours';

export function optionKind(question: Question): OptionKind {
  switch (question.type) {
    case 'flag-builder':
      return 'colours';
    case 'continent-challenge':
    case 'good-to-know':
    case 'find-the-lie':
    case 'in-common':
      // Language / currency / dialing code / domain / statement options — plain text.
      return 'text';
    case 'odd-one-out':
      // Options are the countries themselves; show their names.
      return 'country-name';
    case 'capital-challenge':
      // "capital" direction: options are capital-city strings.
      return question.id.startsWith('capital-challenge-capital-') ? 'text' : 'country-name';
    case 'flag-detective':
      // "country" direction ("Which flag belongs to X?"): options are flags.
      return question.id.startsWith('flag-detective-country-') ? 'country-flag' : 'country-name';
    case 'map-find-it':
    case 'geography-detective':
    case 'shape-detective':
    default:
      return 'country-name';
  }
}

/** Whether the prompt itself should display a flag (flag → country direction). */
export function promptShowsFlag(question: Question): boolean {
  return question.type === 'flag-detective' && question.id.startsWith('flag-detective-flag-');
}

/** Whether the prompt should display a country silhouette to identify. */
export function promptShowsShape(question: Question): boolean {
  return question.type === 'shape-detective';
}

/** Map-based question that should offer the interactive map (with a non-map fallback). */
export function isMapQuestion(question: Question): boolean {
  return question.type === 'map-find-it';
}

/** Display colours for Flag Builder swatches. */
export const COLOUR_HEX: Record<string, string> = {
  red: '#d7141a',
  white: '#ffffff',
  blue: '#0052b4',
  green: '#009543',
  orange: '#ff883e',
  black: '#1a1a1a',
  gold: '#ffd700',
  yellow: '#ffda44',
};

export const DEFAULT_SESSION_LENGTH = 8;
