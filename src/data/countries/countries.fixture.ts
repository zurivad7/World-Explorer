import type { Country } from '@/types';

/**
 * Phase 0 seed slice — three countries spanning three continents, enough to
 * exercise the schema, loaders and validation tooling. The full 50-country
 * vertical slice (PRD §24) is authored in Phase 1 from open datasets.
 *
 * Neighbours are intentionally empty here: none of these three border each
 * other, and referential integrity requires neighbour ids to exist in the
 * dataset. Neighbour graphs are populated with the full slice in Phase 1.
 */
export const countries: Country[] = [
  {
    id: 'fr',
    iso2: 'fr',
    iso3: 'FRA',
    name: 'France',
    capital: 'Paris',
    continent: 'Europe',
    region: 'Western Europe',
    flagAsset: '/assets/flags/fr.svg',
    geometryId: 'fr',
    neighbours: [],
    facts: [
      { text: 'The Eiffel Tower in Paris is over 300 metres tall.', source: 'world-explorer/seed' },
      { text: 'France has coastlines on the Atlantic Ocean and the Mediterranean Sea.', source: 'world-explorer/seed' },
    ],
    active: true,
    source: 'world-countries',
    reviewedAt: '2026-08-13',
  },
  {
    id: 'br',
    iso2: 'br',
    iso3: 'BRA',
    name: 'Brazil',
    capital: 'Brasília',
    continent: 'South America',
    region: 'South America',
    flagAsset: '/assets/flags/br.svg',
    geometryId: 'br',
    neighbours: [],
    facts: [
      { text: 'Brazil is the largest country in South America.', source: 'world-explorer/seed' },
      { text: 'The Amazon rainforest covers much of northern Brazil.', source: 'world-explorer/seed' },
    ],
    active: true,
    source: 'world-countries',
    reviewedAt: '2026-08-13',
  },
  {
    id: 'jp',
    iso2: 'jp',
    iso3: 'JPN',
    name: 'Japan',
    capital: 'Tokyo',
    continent: 'Asia',
    region: 'Eastern Asia',
    flagAsset: '/assets/flags/jp.svg',
    geometryId: 'jp',
    neighbours: [],
    facts: [
      { text: 'Japan is made up of thousands of islands.', source: 'world-explorer/seed' },
      { text: 'Mount Fuji is the highest mountain in Japan.', source: 'world-explorer/seed' },
    ],
    active: true,
    source: 'world-countries',
    reviewedAt: '2026-08-13',
  },
];
