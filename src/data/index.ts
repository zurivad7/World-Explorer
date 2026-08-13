import type { Country, GameMode, Question } from '@/types';
import countriesJson from './countries/countries.generated.json';
import questionsJson from './questions/questions.generated.json';
import { achievements } from './achievements/achievements';

/**
 * Runtime content entry point. The country and question banks are generated and
 * validated at build time by scripts/build-content.ts (`npm run build:content`)
 * from `world-countries` + `flag-icons` and the authored sources under
 * src/data/countries/source.ts. The JSON is cast to the domain types here; its
 * integrity is guaranteed by validate:content in CI, not re-checked on every load.
 */
export const countries = countriesJson as unknown as Country[];
export const questions = questionsJson as unknown as Question[];
export { achievements };
export * from './schema';
export * from './validate';

const countryById = new Map(countries.map((c) => [c.id, c]));

export function getCountryById(id: string): Country | undefined {
  return countryById.get(id);
}

export function getQuestionsForMode(mode: GameMode): Question[] {
  return questions.filter((q) => q.type === mode && q.active);
}

export function getCountriesByContinent(): Map<string, Country[]> {
  const map = new Map<string, Country[]>();
  for (const c of countries) {
    const list = map.get(c.continent) ?? [];
    list.push(c);
    map.set(c.continent, list);
  }
  return map;
}
