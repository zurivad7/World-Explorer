/**
 * Content build (PRD §15, §24). Assembles the full dataset of independent
 * countries from `world-countries`, enriched by authored facts/hints in
 * src/data/countries/source.ts, copies flag SVGs from `flag-icons`, builds map
 * geometry, generates the question bank, and validates the result. Output is
 * committed under src/data and public/assets/flags so the runtime never depends
 * on the source packages.
 *
 * Run with `npm run build:content`.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Continent, Country, Currency, Question } from '../src/types/index.ts';
import { COUNTRY_SOURCES, NOTABLE_RIVERS } from '../src/data/countries/source.ts';
import { FLAG_TEMPLATES } from '../src/data/flags/templates.ts';
import { generateQuestions } from '../src/data/generate.ts';
import { validateCompleteness, validateContent } from '../src/data/validate.ts';
import { achievements } from '../src/data/achievements/achievements.ts';

const require = createRequire(import.meta.url);
const worldCountries = require('world-countries') as WcCountry[];

interface WcCountry {
  cca2: string;
  cca3: string;
  ccn3?: string;
  name: { common: string };
  capital?: string[];
  region: string;
  subregion?: string;
  borders?: string[];
  independent?: boolean;
  area?: number;
  landlocked?: boolean;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
  idd?: { root?: string; suffixes?: string[] };
  demonyms?: { eng?: { m?: string; f?: string } };
  latlng?: [number, number];
  tld?: string[];
}

function firstCurrency(wc: WcCountry): Currency | undefined {
  const entries = Object.entries(wc.currencies ?? {});
  const first = entries[0];
  if (!first) return undefined;
  const [code, info] = first;
  const currency: Currency = { code, name: info.name };
  if (info.symbol) currency.symbol = info.symbol;
  return currency;
}

function callingCode(wc: WcCountry): string | undefined {
  const root = wc.idd?.root;
  if (!root) return undefined;
  const suffixes = wc.idd?.suffixes;
  return suffixes && suffixes.length === 1 ? `${root}${suffixes[0]}` : root;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REVIEWED_AT = '2026-08-13';
const flagsSrcDir = resolve(root, 'node_modules/flag-icons/flags/4x3');

/** Returns the teaching continent, or null if the region can't be mapped. */
function continentFor(wc: WcCountry): Continent | null {
  switch (wc.region) {
    case 'Europe':
      return 'Europe';
    case 'Asia':
      return 'Asia';
    case 'Africa':
      return 'Africa';
    case 'Oceania':
      return 'Oceania';
    case 'Antarctic':
      return 'Antarctica';
    case 'Americas':
      return wc.subregion === 'South America' ? 'South America' : 'North America';
    default:
      return null;
  }
}

/** Difficulty hint derived from land area when no hand-tuned hint exists. */
function mapSizeForArea(area = 0): 'large' | 'medium' | 'small' {
  if (area >= 400_000) return 'large';
  if (area >= 30_000) return 'medium';
  return 'small';
}

// Authored enrichment (facts, difficulty hints, continent overrides) for the
// originally-curated countries. Everything else is derived from world-countries.
const overlayById = new Map(COUNTRY_SOURCES.map((s) => [s.iso2.toLowerCase(), s]));

const wcByCca2 = new Map(worldCountries.map((c) => [c.cca2, c]));

// Include every independent country that has a capital, a flag SVG and a mappable
// continent (PRD §24 — full dataset). Micro-states missing map geometry are still
// included in the dataset; they simply aren't drawn on the map.
const included = worldCountries.filter(
  (wc) =>
    wc.independent === true &&
    Boolean(wc.capital?.[0]) &&
    continentFor(wc) !== null &&
    existsSync(resolve(flagsSrcDir, `${wc.cca2.toLowerCase()}.svg`))
);

const cca3ToId = new Map<string, string>();
for (const wc of included) cca3ToId.set(wc.cca3, wc.cca2.toLowerCase());

const countries: Country[] = included
  .map((wc): Country => {
    const id = wc.cca2.toLowerCase();
    const overlay = overlayById.get(id);
    const neighbours = (wc.borders ?? [])
      .map((b) => cca3ToId.get(b))
      .filter((n): n is string => Boolean(n))
      .sort();

    const country: Country = {
      id,
      iso2: id,
      iso3: wc.cca3,
      name: wc.name.common,
      capital: wc.capital![0]!,
      continent: overlay?.continentOverride ?? continentFor(wc)!,
      region: wc.subregion || wc.region,
      flagAsset: `/assets/flags/${id}.svg`,
      geometryId: id,
      neighbours,
      facts: overlay ? overlay.facts.map((text) => ({ text, source: 'world-explorer/authored' })) : [],
      area: wc.area ?? 0,
      landlocked: Boolean(wc.landlocked),
      languages: Object.values(wc.languages ?? {}),
      active: true,
      source: 'world-countries',
    };
    // Verifiable optional fields — only set when present (exactOptionalPropertyTypes).
    const currency = firstCurrency(wc);
    if (currency) country.currency = currency;
    const idd = callingCode(wc);
    if (idd) country.callingCode = idd;
    const tld = wc.tld?.[0];
    if (tld) country.tld = tld;
    const demonym = wc.demonyms?.eng?.m;
    if (demonym) country.demonym = demonym;
    const river = NOTABLE_RIVERS[id];
    if (river) country.notableRiver = river;
    // Representative point [lat, lng] — used to pin countries too small to draw.
    if (Array.isArray(wc.latlng) && wc.latlng.length === 2) {
      country.latlng = [wc.latlng[0]!, wc.latlng[1]!];
    }
    // Only the hand-authored/reviewed set carries a review date.
    if (overlay) country.reviewedAt = REVIEWED_AT;
    return country;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Copy flag SVGs into public/assets/flags.
const flagsOutDir = resolve(root, 'public/assets/flags');
mkdirSync(flagsOutDir, { recursive: true });
for (const c of countries) {
  copyFileSync(resolve(flagsSrcDir, `${c.id}.svg`), resolve(flagsOutDir, `${c.id}.svg`));
}

// Generate the question bank. Difficulty hints come from the authored overlay
// where present, otherwise from land area.
const hints = new Map(
  countries.map((c) => {
    const overlay = overlayById.get(c.id);
    const mapSize = overlay?.mapSize ?? mapSizeForArea(wcByCca2.get(c.iso2.toUpperCase())?.area);
    return [c.id, overlay?.similarFlag ? { mapSize, similarFlag: true } : { mapSize }] as const;
  })
);
const questions: Question[] = generateQuestions({ countries, hints, templates: FLAG_TEMPLATES });

// Build country geometry (PRD §16): convert Natural Earth (via world-atlas)
// TopoJSON to GeoJSON, keep only the slice, key each feature by geometryId.
const topo = require('world-atlas/countries-50m.json') as Topology;
const ccn3ToId = new Map<string, string>();
for (const c of countries) {
  const ccn3 = wcByCca2.get(c.iso2.toUpperCase())?.ccn3;
  if (ccn3) ccn3ToId.set(ccn3, c.id);
}
const countriesObject = topo.objects.countries;
if (!countriesObject) throw new Error('world-atlas topology has no "countries" object');
const worldFc = feature(topo, countriesObject) as unknown as FeatureCollection<Geometry>;

// Countries that cross the ±180° antimeridian (Russia, Fiji) are stored with
// coordinates that jump from +180 to -180. Rendered in Leaflet that draws the
// polygon fill as a band straight across the map. Unwrapping keeps each ring's
// consecutive longitudes within 180° of each other, so the polygon stays
// contiguous (extending just past 180° rather than wrapping).
type Ring = number[][];
// Round to 2 decimals (~1 km): plenty for a world/country-zoom map, and it keeps
// the higher-resolution 50m geometry file small enough to ship.
const round2 = (n: number): number => Math.round(n * 100) / 100;
function unwrapRing(ring: Ring): Ring {
  if (ring.length === 0) return ring;
  let prev = ring[0]![0]!;
  return ring.map((pt, i) => {
    if (i === 0) return [round2(pt[0]!), round2(pt[1]!)];
    let lng = pt[0]!;
    while (lng - prev > 180) lng -= 360;
    while (prev - lng > 180) lng += 360;
    prev = lng;
    return [round2(lng), round2(pt[1]!)];
  });
}
function unwrapGeometry(geom: Geometry): Geometry {
  if (geom.type === 'Polygon') {
    return { ...geom, coordinates: (geom.coordinates as Ring[]).map(unwrapRing) };
  }
  if (geom.type === 'MultiPolygon') {
    return { ...geom, coordinates: (geom.coordinates as Ring[][]).map((p) => p.map(unwrapRing)) };
  }
  return geom;
}

const features = worldFc.features
  .filter((f) => f.id != null && ccn3ToId.has(String(f.id)))
  .map((f) => {
    const id = ccn3ToId.get(String(f.id))!;
    const country = countries.find((c) => c.id === id)!;
    return {
      type: 'Feature' as const,
      id,
      properties: { id, name: country.name },
      geometry: unwrapGeometry(f.geometry),
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

// Micro-states (e.g. Singapore, Malta, Monaco) aren't in the 110m map data. They
// stay in the dataset (list, games, detail) but aren't drawn on the map — they are
// invisible at world zoom anyway.
const withoutGeometry = countries.filter((c) => !features.some((f) => f.id === c.id));
const geometryFc: FeatureCollection<Geometry> = { type: 'FeatureCollection', features };

// Write generated data (stable, pretty-printed for review where practical).
const dataDir = resolve(root, 'src/data');
writeFileSync(
  resolve(dataDir, 'countries/countries.generated.json'),
  JSON.stringify(countries, null, 2) + '\n'
);
writeFileSync(
  resolve(dataDir, 'questions/questions.generated.json'),
  JSON.stringify(questions, null, 2) + '\n'
);
mkdirSync(resolve(dataDir, 'geometry'), { recursive: true });
// Geometry is machine data (large coordinate arrays) — write compact.
writeFileSync(
  resolve(dataDir, 'geometry/countries.geo.json'),
  JSON.stringify(geometryFc) + '\n'
);

// Validate before finishing so a bad build fails loudly.
const structural = validateContent({ countries, questions, achievements });
const completeness = validateCompleteness({ countries, questions, achievements });
const errors = [...structural.errors, ...completeness.errors];
const warnings = [...structural.warnings, ...completeness.warnings];
for (const w of warnings) console.warn(`  warning: ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`  error: ${e}`);
  console.error(`\nContent build FAILED: ${errors.length} validation error(s).`);
  process.exit(1);
}

const perMode = questions.reduce<Record<string, number>>((acc, q) => {
  acc[q.type] = (acc[q.type] ?? 0) + 1;
  return acc;
}, {});
console.log(
  `Built ${countries.length} countries, ${questions.length} questions, ${features.length} map geometries, copied ${countries.length} flags.`
);
if (withoutGeometry.length > 0) {
  console.log(
    `  ${withoutGeometry.length} countries in the dataset shown by map pin (no 50m polygon): ${withoutGeometry
      .map((c) => c.id)
      .join(', ')}`
  );
}
console.log('Questions per mode:', perMode);
