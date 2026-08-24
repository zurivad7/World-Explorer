import { describe, expect, it } from 'vitest';
import { generateQuestions, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(
  id: string,
  name: string,
  extra: Partial<Country>
): Country {
  return {
    id,
    iso2: id,
    iso3: id.toUpperCase(),
    name,
    capital: `${name} City`,
    continent: 'Europe',
    region: 'Test',
    flagAsset: `/assets/flags/${id}.svg`,
    geometryId: id,
    neighbours: [],
    facts: [],
    area: 1000,
    landlocked: false,
    languages: [],
    active: true,
    source: 'test',
    ...extra,
  };
}

// Four countries, each with a distinct language / currency / dialing code / TLD,
// so there are enough distinct values (≥4) to build fact questions with distractors.
const countries: Country[] = [
  country('aa', 'Aland', { languages: ['Aish'], currency: { code: 'AAA', name: 'Aland dollar' }, callingCode: '+1', tld: '.aa' }),
  country('bb', 'Beeland', { languages: ['Beeish'], currency: { code: 'BBB', name: 'Bee peso' }, callingCode: '+2', tld: '.bb' }),
  country('cc', 'Ceeland', { languages: ['Ceeish'], currency: { code: 'CCC', name: 'Cee franc' }, callingCode: '+3', tld: '.cc' }),
  country('dd', 'Deeland', { languages: ['Deeish'], currency: { code: 'DDD', name: 'Dee krona' }, callingCode: '+4', tld: '.dd' }),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map(countries.map((c) => [c.id, { mapSize: 'medium' as const }])),
  templates: [],
};

const questions = generateQuestions(inputs);
const good = questions.filter((q) => q.type === 'good-to-know');

describe('good-to-know questions', () => {
  it('generates language, currency, dialing-code and domain questions per country', () => {
    for (const kind of ['language', 'currency', 'calling', 'tld']) {
      expect(good.some((q) => q.id === `good-to-know-${kind}-aa`)).toBe(true);
    }
    // 4 kinds × 4 countries.
    expect(good).toHaveLength(16);
  });

  it('tags them with the facts topic and always includes the correct answer', () => {
    for (const q of good) {
      expect(q.topic).toBe('facts');
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('never offers a language the country actually speaks as a wrong option', () => {
    const langQ = good.find((q) => q.id === 'good-to-know-language-aa')!;
    expect(langQ.correctAnswer).toBe('Aish');
    // "Aish" is Aland's language; no other option should be one of its languages.
    expect(langQ.options.filter((o) => o === 'Aish')).toHaveLength(1);
  });

  it('asks about the internet domain using the country tld', () => {
    const tldQ = good.find((q) => q.id === 'good-to-know-tld-bb')!;
    expect(tldQ.correctAnswer).toBe('.bb');
    expect(tldQ.prompt).toContain('Beeland');
  });
});
