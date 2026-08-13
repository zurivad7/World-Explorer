import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * Map provider abstraction (PRD §16).
 *
 * Everything here is pure and provider-agnostic: game and UI code deal in
 * **country ids**, map state and style *intent* — never Leaflet objects. The
 * Leaflet-specific rendering lives in WorldMap.tsx and depends on this model,
 * not the other way round.
 */

export interface CountryFeatureProps {
  id: string;
  name: string;
}

export type CountryFeature = Feature<Geometry, CountryFeatureProps>;
export type CountryFeatureCollection = FeatureCollection<Geometry, CountryFeatureProps>;

/** Visual state a country polygon can be in. */
export type CountryVisualState = 'default' | 'discovered' | 'mastered' | 'selected' | 'highlighted';

export interface MapStateInput {
  selectedId?: string | undefined;
  discoveredIds?: ReadonlySet<string>;
  masteredIds?: ReadonlySet<string>;
  /** Extra ids to emphasise (e.g. the target of a "Find it" prompt once revealed). */
  highlightedIds?: ReadonlySet<string>;
}

/** Resolve the visual state of a single country. Selection wins over everything. */
export function resolveCountryState(id: string, input: MapStateInput): CountryVisualState {
  if (input.selectedId === id) return 'selected';
  if (input.highlightedIds?.has(id)) return 'highlighted';
  if (input.masteredIds?.has(id)) return 'mastered';
  if (input.discoveredIds?.has(id)) return 'discovered';
  return 'default';
}

export interface PolygonStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillOpacity: number;
}

/** Map a visual state to concrete polygon styling. Kept data-only so it is testable. */
export function styleForState(state: CountryVisualState): PolygonStyle {
  switch (state) {
    case 'selected':
      return { fill: '#1d6fb8', stroke: '#0d3f6e', strokeWidth: 2, fillOpacity: 0.9 };
    case 'highlighted':
      return { fill: '#f5a623', stroke: '#b9791a', strokeWidth: 2, fillOpacity: 0.9 };
    case 'mastered':
      return { fill: '#2e9e5b', stroke: '#1f6e40', strokeWidth: 1, fillOpacity: 0.85 };
    case 'discovered':
      return { fill: '#8fc4ec', stroke: '#5b93bd', strokeWidth: 1, fillOpacity: 0.85 };
    case 'default':
    default:
      return { fill: '#cfe0ee', stroke: '#9db6cc', strokeWidth: 1, fillOpacity: 0.85 };
  }
}

/** Extract a country id from a clicked feature, or undefined if it isn't one of ours. */
export function featureCountryId(feature: Pick<CountryFeature, 'id' | 'properties'>): string | undefined {
  if (typeof feature.id === 'string') return feature.id;
  return feature.properties?.id;
}

export type LatLngBounds = [[number, number], [number, number]];

/**
 * Compute the geographic bounds of a feature's coordinates as
 * [[south, west], [north, east]] (Leaflet order), or undefined if it has none.
 * Used for "fit to country" (PRD §7.4).
 */
export function featureBounds(feature: CountryFeature): LatLngBounds | undefined {
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  const visit = (coords: unknown): void => {
    if (typeof coords === 'number') return;
    if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lng, lat] = coords as [number, number];
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      return;
    }
    if (Array.isArray(coords)) coords.forEach(visit);
  };

  const geom = feature.geometry;
  if (geom && 'coordinates' in geom) visit(geom.coordinates);
  if (!Number.isFinite(minLat) || !Number.isFinite(minLng)) return undefined;
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}
