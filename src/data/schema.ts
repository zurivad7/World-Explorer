import { z } from 'zod';
import { AGE_BANDS, CONTINENTS, DIFFICULTIES, GAME_MODES } from '@/types';

/**
 * Runtime validation schemas for geography content (PRD §15).
 *
 * Content is authored as version-controlled data (src/data) and must never be
 * hard-coded into UI components. These schemas back both the runtime loaders and
 * the `validate:content` script.
 */

export const continentSchema = z.enum(CONTINENTS as unknown as [string, ...string[]]);
export const ageBandSchema = z.enum(AGE_BANDS as unknown as [string, ...string[]]);
export const difficultySchema = z.enum(DIFFICULTIES as unknown as [string, ...string[]]);
export const gameModeSchema = z.enum(GAME_MODES as unknown as [string, ...string[]]);
export const topicSchema = z.enum(['flags', 'capitals', 'continents', 'location', 'clues']);

const iso2 = z.string().regex(/^[a-z]{2}$/, 'iso2 must be two lowercase letters');
const iso3 = z.string().regex(/^[A-Z]{3}$/, 'iso3 must be three uppercase letters');

export const countryFactSchema = z.object({
  text: z.string().min(1),
  source: z.string().optional(),
});

export const countrySchema = z.object({
  id: iso2,
  iso2,
  iso3,
  name: z.string().min(1),
  capital: z.string().min(1),
  continent: continentSchema,
  region: z.string().min(1),
  flagAsset: z.string().min(1),
  geometryId: z.string().min(1),
  neighbours: z.array(z.string()),
  // Facts are authored/reviewed and optional — most countries have none yet.
  facts: z.array(countryFactSchema),
  active: z.boolean(),
  source: z.string().min(1),
  reviewedAt: z.string().optional(),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  type: gameModeSchema,
  difficulty: difficultySchema,
  ageBands: z.array(ageBandSchema).min(1),
  topic: topicSchema,
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
  countryId: z.string().optional(),
  active: z.boolean(),
  source: z.string().min(1),
  reviewedAt: z.string().optional(),
});

export const achievementSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  criteria: z.object({
    kind: z.enum([
      'countries-discovered',
      'topic-mastered',
      'continent-completed',
      'games-completed',
    ]),
    threshold: z.number().int().positive(),
    topic: topicSchema.optional(),
    continent: continentSchema.optional(),
  }),
  active: z.boolean(),
});

export const countriesSchema = z.array(countrySchema);
export const questionsSchema = z.array(questionSchema);
export const achievementsSchema = z.array(achievementSchema);
