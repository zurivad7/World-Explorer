import type { Achievement, Country, Question } from '@/types';
import { achievementsSchema, countriesSchema, questionsSchema } from './schema';

/**
 * Content integrity checks (PRD §15). Runs both as a build-time CLI
 * (`npm run validate:content`) and can be reused in tests. Catches missing
 * capitals/flags/ids, duplicate questions and invalid references *before* they
 * ever reach a child.
 */

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export interface ContentInput {
  countries: Country[];
  questions: Question[];
  achievements: Achievement[];
}

export function validateContent(input: ContentInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Shape validation via zod.
  const countriesParsed = countriesSchema.safeParse(input.countries);
  if (!countriesParsed.success) {
    for (const issue of countriesParsed.error.issues) {
      errors.push(`country[${issue.path.join('.')}]: ${issue.message}`);
    }
  }
  const questionsParsed = questionsSchema.safeParse(input.questions);
  if (!questionsParsed.success) {
    for (const issue of questionsParsed.error.issues) {
      errors.push(`question[${issue.path.join('.')}]: ${issue.message}`);
    }
  }
  const achievementsParsed = achievementsSchema.safeParse(input.achievements);
  if (!achievementsParsed.success) {
    for (const issue of achievementsParsed.error.issues) {
      errors.push(`achievement[${issue.path.join('.')}]: ${issue.message}`);
    }
  }

  // Referential checks only make sense once shapes are valid.
  if (errors.length > 0) return { errors, warnings };

  const countryIds = new Set(input.countries.map((c) => c.id));

  // 2. Unique country ids + required fields.
  const seenCountry = new Set<string>();
  for (const c of input.countries) {
    if (seenCountry.has(c.id)) errors.push(`duplicate country id: ${c.id}`);
    seenCountry.add(c.id);
    if (!c.capital.trim()) errors.push(`country ${c.id} is missing a capital`);
    if (!c.flagAsset.trim()) errors.push(`country ${c.id} is missing a flag asset`);
    for (const n of c.neighbours) {
      if (!countryIds.has(n)) errors.push(`country ${c.id} references unknown neighbour: ${n}`);
    }
  }

  // 3. Unique question ids + answer/reference integrity.
  const seenQuestion = new Set<string>();
  for (const q of input.questions) {
    if (seenQuestion.has(q.id)) errors.push(`duplicate question id: ${q.id}`);
    seenQuestion.add(q.id);
    if (!q.options.includes(q.correctAnswer)) {
      errors.push(`question ${q.id}: correctAnswer "${q.correctAnswer}" is not one of its options`);
    }
    if (q.countryId && !countryIds.has(q.countryId)) {
      errors.push(`question ${q.id} references unknown country: ${q.countryId}`);
    }
  }

  // 4. Unique achievement ids.
  const seenAchievement = new Set<string>();
  for (const a of input.achievements) {
    if (seenAchievement.has(a.id)) errors.push(`duplicate achievement id: ${a.id}`);
    seenAchievement.add(a.id);
  }

  // 5. Coverage warnings (non-fatal in Phase 0, tightened in later phases).
  const modesWithQuestions = new Set(input.questions.map((q) => q.type));
  for (const c of input.countries) {
    if (c.facts.length < 2) {
      warnings.push(`country ${c.id} has fewer than 2 child-friendly facts`);
    }
  }
  const expectedModes = [
    'flag-detective',
    'capital-challenge',
    'continent-challenge',
    'map-find-it',
    'geography-detective',
    'flag-builder',
  ] as const;
  for (const mode of expectedModes) {
    if (!modesWithQuestions.has(mode)) {
      warnings.push(`no questions yet for game mode: ${mode}`);
    }
  }

  return { errors, warnings };
}
