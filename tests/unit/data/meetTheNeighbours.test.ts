import { describe, expect, it } from 'vitest';
import { generateQuestions, type GeneratorInputs } from '@/data/generate';
import type { Country } from '@/types';

function country(id: string, name: string, neighbours: string[]): Country {
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
    neighbours,
    facts: [],
    area: 100000,
    landlocked: false,
    languages: ['Testish'],
    active: true,
    source: 'test',
  };
}

// `mid` borders n1 and n2; `alt` also borders both (a uniqueness trap); plus fillers.
const countries: Country[] = [
  country('mid', 'Middle', ['n1', 'n2', 'n3']),
  country('n1', 'North', ['mid', 'alt']),
  country('n2', 'South', ['mid', 'alt']),
  country('n3', 'East', ['mid']),
  country('alt', 'Alt', ['n1', 'n2']), // borders both n1 & n2 — must never be an option here
  country('f1', 'Filler1', []),
  country('f2', 'Filler2', []),
  country('f3', 'Filler3', []),
  country('f4', 'Filler4', []),
];

const inputs: GeneratorInputs = {
  countries,
  hints: new Map(countries.map((c) => [c.id, { mapSize: 'medium' as const }])),
  templates: [],
};

const mtn = generateQuestions(inputs).filter((q) => q.type === 'meet-the-neighbours');
const byId = new Map(countries.map((c) => [c.id, c]));

describe('meet-the-neighbours', () => {
  it('only makes a question for countries with at least two neighbours', () => {
    const ids = mtn.map((q) => q.countryId);
    expect(ids).toContain('mid'); // 3 neighbours
    expect(ids).not.toContain('n3'); // only 1 neighbour
    expect(ids).not.toContain('f1'); // island, 0 neighbours
  });

  it('shows two neighbour flags and asks for the country bordering both', () => {
    const q = mtn.find((x) => x.countryId === 'mid')!;
    expect(q.topic).toBe('location');
    expect(q.subjectIds).toHaveLength(2);
    // Both shown countries are genuine neighbours of the answer.
    for (const id of q.subjectIds!) {
      expect(byId.get('mid')!.neighbours).toContain(id);
    }
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
    expect(q.correctAnswer).toBe('mid');
  });

  it('never offers a distractor that also borders both shown neighbours', () => {
    for (const q of mtn) {
      const [n1, n2] = q.subjectIds!;
      for (const opt of q.options) {
        if (opt === q.correctAnswer) continue;
        const x = byId.get(opt)!;
        expect(x.neighbours.includes(n1!) && x.neighbours.includes(n2!)).toBe(false);
      }
    }
  });
});
