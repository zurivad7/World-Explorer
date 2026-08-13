import type { CountryFeatureCollection } from './mapModel';

/**
 * Lazily load the country geometry (~200KB) so it is code-split out of the main
 * bundle and only fetched when a map is actually shown (PRD §23 fast first load).
 * Once loaded it is cached by the service worker for offline use (PRD §20).
 */
let cache: CountryFeatureCollection | undefined;

export async function loadCountryGeometry(): Promise<CountryFeatureCollection> {
  if (cache) return cache;
  const mod = await import('@/data/geometry/countries.geo.json');
  cache = mod.default as unknown as CountryFeatureCollection;
  return cache;
}
