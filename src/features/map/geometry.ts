import type { CountryFeatureCollection } from './mapModel';

/**
 * Lazily load the country geometry so it is code-split out of the main bundle and
 * only fetched when a map is actually shown (PRD §23 fast first load). Once loaded
 * it is cached by the service worker for offline use (PRD §20).
 */
let countryCache: CountryFeatureCollection | undefined;

/** All countries that have map geometry (the interactive world map). */
export async function loadCountryGeometry(): Promise<CountryFeatureCollection> {
  if (countryCache) return countryCache;
  const mod = await import('@/data/geometry/countries.geo.json');
  countryCache = mod.default as unknown as CountryFeatureCollection;
  return countryCache;
}
