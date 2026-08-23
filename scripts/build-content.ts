/**
 * Content build (PRD §15, §24). Assembles the 50-country slice from
 * `world-countries`, copies flag SVGs from `flag-icons`, generates the question
 * bank, and validates the result. Output is committed under src/data and
 * public/assets/flags so the runtime never depends on the source packages.
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
import type { Continent, Country, Question } from '../src/types/index.ts';
import { COUNTRY_SOURCES } from '../src/data/countries/source.ts';
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
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REVIEWED_AT = '2026-08-13';

function continentFor(wc: WcCountry): Continent {
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
      throw new Error(`Unmapped region "${wc.region}" for ${wc.cca2}`);
  }
}

// Build lookup + the cca3 -> iso2 map limited to the selected slice.
const selected = COUNTRY_SOURCES.map((s) => s.iso2.toUpperCase());
const wcByCca2 = new Map(worldCountries.map((c) => [c.cca2, c]));
const cca3ToId = new Map<string, string>();
for (const iso of selected) {
  const wc = wcByCca2.get(iso);
  if (!wc) throw new Error(`world-countries has no entry for ${iso}`);
  cca3ToId.set(wc.cca3, wc.cca2.toLowerCase());
}

const countries: Country[] = COUNTRY_SOURCES.map((src) => {
  const wc = wcByCca2.get(src.iso2.toUpperCase());
  if (!wc) throw new Error(`world-countries has no entry for ${src.iso2}`);
  const capital = wc.capital?.[0];
  if (!capital) throw new Error(`No capital for ${src.iso2}`);

  const neighbours = (wc.borders ?? [])
    .map((b) => cca3ToId.get(b))
    .filter((id): id is string => Boolean(id))
    .sort();

  return {
    id: src.iso2.toLowerCase(),
    iso2: src.iso2.toLowerCase(),
    iso3: wc.cca3,
    name: wc.name.common,
    capital,
    continent: src.continentOverride ?? continentFor(wc),
    region: wc.subregion ?? wc.region,
    flagAsset: `/assets/flags/${src.iso2.toLowerCase()}.svg`,
    geometryId: src.iso2.toLowerCase(),
    neighbours,
    facts: src.facts.map((text) => ({ text, source: 'world-explorer/authored' })),
    active: true,
    source: 'world-countries',
    reviewedAt: REVIEWED_AT,
  };
});

// Copy flag SVGs into public/assets/flags.
const flagsSrcDir = resolve(root, 'node_modules/flag-icons/flags/4x3');
const flagsOutDir = resolve(root, 'public/assets/flags');
mkdirSync(flagsOutDir, { recursive: true });
for (const c of countries) {
  const from = resolve(flagsSrcDir, `${c.id}.svg`);
  if (!existsSync(from)) throw new Error(`Missing flag SVG for ${c.id} at ${from}`);
  copyFileSync(from, resolve(flagsOutDir, `${c.id}.svg`));
}

// Generate the question bank.
const hints = new Map(
  COUNTRY_SOURCES.map((s) => [
    s.iso2.toLowerCase(),
    s.similarFlag ? { mapSize: s.mapSize, similarFlag: true } : { mapSize: s.mapSize },
  ])
);
const questions: Question[] = generateQuestions({ countries, hints, templates: FLAG_TEMPLATES });

// Build country geometry (PRD §16): convert Natural Earth (via world-atlas)
// TopoJSON to GeoJSON, keep only the slice, key each feature by geometryId.
const topo = require('world-atlas/countries-110m.json') as Topology;
const ccn3ToId = new Map<string, string>();
for (const c of countries) {
  const wc = wcByCca2.get(c.iso2.toUpperCase());
  if (!wc?.ccn3) throw new Error(`No ccn3 for ${c.iso2}`);
  ccn3ToId.set(wc.ccn3, c.id);
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
function unwrapRing(ring: Ring): Ring {
  if (ring.length === 0) return ring;
  let prev = ring[0]![0]!;
  return ring.map((pt, i) => {
    if (i === 0) return pt;
    let lng = pt[0]!;
    while (lng - prev > 180) lng -= 360;
    while (prev - lng > 180) lng += 360;
    prev = lng;
    return [lng, pt[1]!];
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

const missingGeometry = countries.filter((c) => !features.some((f) => f.id === c.id));
if (missingGeometry.length > 0) {
  throw new Error(`Missing geometry for: ${missingGeometry.map((c) => c.id).join(', ')}`);
}
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
  `Built ${countries.length} countries, ${questions.length} questions, ${features.length} geometries, copied ${countries.length} flags.`
);
console.log('Questions per mode:', perMode);
