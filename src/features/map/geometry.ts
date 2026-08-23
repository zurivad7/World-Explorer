import type { FeatureCollection, Geometry } from 'geojson';
import type { CountryFeatureCollection } from './mapModel';

/**
 * Lazily load map geometry so it is code-split out of the main bundle and only
 * fetched when a map is actually shown (PRD §23 fast first load). Once loaded it
 * is cached by the service worker for offline use (PRD §20).
 */
let countryCache: CountryFeatureCollection | undefined;
let baseCache: FeatureCollection<Geometry> | undefined;

/** The 50 explorable countries (interactive). */
export async function loadCountryGeometry(): Promise<CountryFeatureCollection> {
  if (countryCache) return countryCache;
  const mod = await import('@/data/geometry/countries.geo.json');
  countryCache = mod.default as unknown as CountryFeatureCollection;
  return countryCache;
}

/** The rest of the world's countries, drawn as a faint non-interactive base. */
export async function loadWorldBaseGeometry(): Promise<FeatureCollection<Geometry>> {
  if (baseCache) return baseCache;
  const mod = await import('@/data/geometry/world-base.geo.json');
  baseCache = mod.default as unknown as FeatureCollection<Geometry>;
  return baseCache;
}
