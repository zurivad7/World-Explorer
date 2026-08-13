import type { Question } from '@/types';

/**
 * Phase 0 seed questions — a small human-authored set exercising several game
 * modes against the seed countries. The full bank (≥10 per mode, PRD §24) is
 * authored and reviewed in Phase 1. No unreviewed AI-generated child-facing
 * questions (PRD §4).
 */
export const questions: Question[] = [
  {
    id: 'flag-fr-01',
    type: 'flag-detective',
    difficulty: 'easy',
    ageBands: ['5-7', '8-10'],
    topic: 'flags',
    prompt: 'Which country does this flag belong to?',
    options: ['fr', 'br', 'jp'],
    correctAnswer: 'fr',
    explanation: 'This is the flag of France. Its capital is Paris and it is in Europe.',
    countryId: 'fr',
    active: true,
    source: 'world-explorer/seed',
    reviewedAt: '2026-08-13',
  },
  {
    id: 'capital-br-01',
    type: 'capital-challenge',
    difficulty: 'medium',
    ageBands: ['8-10', '11-13'],
    topic: 'capitals',
    prompt: 'What is the capital of Brazil?',
    options: ['Brasília', 'Rio de Janeiro', 'Buenos Aires', 'Lima'],
    correctAnswer: 'Brasília',
    explanation: 'Brasília is the capital of Brazil. Rio de Janeiro is a large city but not the capital.',
    countryId: 'br',
    active: true,
    source: 'world-explorer/seed',
    reviewedAt: '2026-08-13',
  },
  {
    id: 'continent-jp-01',
    type: 'continent-challenge',
    difficulty: 'easy',
    ageBands: ['5-7', '8-10'],
    topic: 'continents',
    prompt: 'Which continent is Japan in?',
    options: ['Asia', 'Europe', 'Africa', 'South America'],
    correctAnswer: 'Asia',
    explanation: 'Japan is a group of islands in Asia.',
    countryId: 'jp',
    active: true,
    source: 'world-explorer/seed',
    reviewedAt: '2026-08-13',
  },
  {
    id: 'map-fr-01',
    type: 'map-find-it',
    difficulty: 'medium',
    ageBands: ['8-10', '11-13'],
    topic: 'location',
    prompt: 'Find France on the map.',
    options: ['fr', 'br', 'jp'],
    correctAnswer: 'fr',
    explanation: 'France is in Western Europe, with coasts on the Atlantic and the Mediterranean.',
    countryId: 'fr',
    active: true,
    source: 'world-explorer/seed',
    reviewedAt: '2026-08-13',
  },
];
