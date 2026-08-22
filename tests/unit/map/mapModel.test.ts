import { describe, expect, it } from 'vitest';
import {
  featureBounds,
  featureCountryId,
  resolveCountryState,
  styleForState,
  type CountryFeature,
} from '@/features/map/mapModel';

describe('resolveCountryState', () => {
  const base = {
    selectedId: 'fr',
    discoveredIds: new Set(['de']),
    masteredIds: new Set(['de']),
    highlightedIds: new Set(['br']),
  };

  it('selection wins over everything', () => {
    expect(resolveCountryState('fr', base)).toBe('selected');
  });

  it('highlight beats mastered/discovered', () => {
    expect(resolveCountryState('br', base)).toBe('highlighted');
  });

  it('mastered beats discovered', () => {
    expect(resolveCountryState('de', base)).toBe('mastered');
  });

  it('falls back to default', () => {
    expect(resolveCountryState('jp', base)).toBe('default');
  });

  it('handles empty input', () => {
    expect(resolveCountryState('jp', {})).toBe('default');
  });
});

describe('styleForState', () => {
  it('gives every state a distinct fill', () => {
    const states = ['default', 'discovered', 'mastered', 'selected', 'highlighted'] as const;
    const fills = states.map((s) => styleForState(s).fill);
    expect(new Set(fills).size).toBe(states.length);
  });
});

describe('featureCountryId', () => {
  it('prefers the feature id', () => {
    expect(featureCountryId({ id: 'fr', properties: { id: 'xx', name: 'X' } })).toBe('fr');
  });

  it('falls back to properties.id', () => {
    expect(
      featureCountryId({ id: undefined, properties: { id: 'br', name: 'Brazil' } } as never)
    ).toBe('br');
  });
});

describe('featureBounds', () => {
  it('computes [[s,w],[n,e]] from a polygon', () => {
    const feature: CountryFeature = {
      type: 'Feature',
      id: 'sq',
      properties: { id: 'sq', name: 'Square' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-10, -5],
            [10, -5],
            [10, 5],
            [-10, 5],
            [-10, -5],
          ],
        ],
      },
    };
    expect(featureBounds(feature)).toEqual([
      [-5, -10],
      [5, 10],
    ]);
  });

  it('handles MultiPolygon and returns undefined for empty geometry', () => {
    const multi: CountryFeature = {
      type: 'Feature',
      id: 'm',
      properties: { id: 'm', name: 'Multi' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [0, 0],
              [2, 0],
              [2, 2],
              [0, 0],
            ],
          ],
          [
            [
              [10, 10],
              [12, 10],
              [12, 12],
              [10, 10],
            ],
          ],
        ],
      },
    };
    expect(featureBounds(multi)).toEqual([
      [0, 0],
      [12, 12],
    ]);

    const empty = { ...multi, geometry: { type: 'MultiPolygon', coordinates: [] } } as CountryFeature;
    expect(featureBounds(empty)).toBeUndefined();
  });
});
