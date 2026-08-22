import type { Country } from '@/types';
import countriesJson from './countries/countries.generated.json';
import { achievements } from './achievements/achievements';

/**
 * Runtime content entry point for country metadata + achievements. Generated and
 * validated at build time by scripts/build-content.ts (`npm run build:content`)
 * from `world-countries` + `flag-icons` and the authored sources under
 * src/data/countries/source.ts. The JSON is cast to the domain types here; its
 * integrity is guaranteed by validate:content in CI, not re-checked on every load.
 *
 * The question bank lives in `@/data/questions` (its own module) so the large
 * question JSON is code-split into the games route rather than the initial bundle.
 */
export const countries = countriesJson as unknown as Country[];
export { achievements };
export * from './schema';
export * from './validate';

const countryById = new Map(countries.map((c) => [c.id, c]));

export function getCountryById(id: string): Country | undefined {
  return countryById.get(id);
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
