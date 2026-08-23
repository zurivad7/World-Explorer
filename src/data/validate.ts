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

  // 5. Content quality warning: a country with exactly one fact is likely a
  //    half-authored record (facts come in pairs). Zero facts is fine — most
  //    countries are not yet enriched.
  for (const c of input.countries) {
    if (c.facts.length === 1) {
      warnings.push(`country ${c.id} has only one fact (expected 0 or 2+)`);
    }
  }

  return { errors, warnings };
}

/** MVP content targets (PRD §24). */
export const MVP_MIN_COUNTRIES = 50;
export const MVP_MIN_QUESTIONS_PER_MODE = 10;
export const MVP_GAME_MODES = [
  'flag-detective',
  'capital-challenge',
  'continent-challenge',
  'map-find-it',
  'geography-detective',
  'flag-builder',
] as const;

/**
 * MVP completeness gates, checked against the full shipped bank (PRD §24, §28,
 * §35). Kept separate from `validateContent` so unit tests can exercise the
 * structural checks on small fixtures without tripping these thresholds.
 */
export function validateCompleteness(input: ContentInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const active = input.countries.filter((c) => c.active);
  if (active.length < MVP_MIN_COUNTRIES) {
    errors.push(`expected at least ${MVP_MIN_COUNTRIES} active countries, found ${active.length}`);
  }

  // Every inhabited continent must be represented (PRD AC-04).
  const inhabited = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
  const present = new Set(active.map((c) => c.continent));
  for (const continent of inhabited) {
    if (!present.has(continent as (typeof active)[number]['continent'])) {
      errors.push(`no countries on continent: ${continent}`);
    }
  }

  // Each country needs flag, capital, continent and a map identity (PRD AC-05).
  for (const c of active) {
    if (!c.flagAsset) errors.push(`country ${c.id} has no flag asset`);
    if (!c.capital) errors.push(`country ${c.id} has no capital`);
    if (!c.geometryId) errors.push(`country ${c.id} has no geometry id`);
  }

  // At least N questions per game mode (PRD §24).
  const perMode = new Map<string, number>();
  for (const q of input.questions) {
    if (q.active) perMode.set(q.type, (perMode.get(q.type) ?? 0) + 1);
  }
  for (const mode of MVP_GAME_MODES) {
    const count = perMode.get(mode) ?? 0;
    if (count < MVP_MIN_QUESTIONS_PER_MODE) {
      errors.push(
        `game mode "${mode}" has ${count} questions, needs at least ${MVP_MIN_QUESTIONS_PER_MODE}`
      );
    }
  }

  return { errors, warnings };
}
