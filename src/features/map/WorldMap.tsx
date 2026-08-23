import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  featureBounds,
  featureCountryId,
  resolveCountryState,
  styleForState,
  type CountryFeature,
  type CountryFeatureCollection,
  type MapStateInput,
} from './mapModel';
import { loadCountryGeometry } from './geometry';

export interface WorldMapProps extends MapStateInput {
  /** Called with a country id when a country polygon is tapped/clicked. */
  onSelectCountry?: (id: string) => void;
  /** Fit the view to this country; if omitted, fit to all countries. */
  focusId?: string;
  /**
   * [lat, lng] fallback pin for the focused country. Used when that country is too
   * small to have its own polygon (micro-states): we drop a marker and centre on it.
   */
  markerLatLng?: [number, number] | undefined;
  /** Optionally show OpenStreetMap tiles under the polygons (off by default; PRD §16/§20). */
  showTiles?: boolean;
  /** Disable panning/zooming (e.g. a static country thumbnail). */
  interactive?: boolean;
  ariaLabel?: string;
  className?: string;
}

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';

function polygonStyle(id: string, state: MapStateInput): L.PathOptions {
  const s = styleForState(resolveCountryState(id, state));
  return { color: s.stroke, weight: s.strokeWidth, fillColor: s.fill, fillOpacity: s.fillOpacity };
}

/**
 * Leaflet-backed world map. This is the *only* place Leaflet is used; it consumes
 * the pure model in mapModel.ts and emits plain country ids. Renders country
 * polygons with no tile layer by default, so it works fully offline (PRD §16/§20).
 */
export function WorldMap({
  onSelectCountry,
  focusId,
  markerLatLng,
  showTiles = false,
  interactive = true,
  ariaLabel = 'World map',
  className,
  ...stateInput
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  // Keep the latest callback/state without re-initialising the map.
  const onSelectRef = useRef(onSelectCountry);
  onSelectRef.current = onSelectCountry;
  const stateRef = useRef<MapStateInput>(stateInput);
  stateRef.current = stateInput;

  // Initialise the Leaflet map once, then load + render geometry.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      attributionControl: showTiles,
      minZoom: 1,
      // Polygons are unwrapped past ±180° at build time (Russia/Fiji); disabling
      // world-copy avoids duplicating those small overhangs on the opposite edge.
      worldCopyJump: false,
    });
    mapRef.current = map;
    map.setView([20, 0], 1);

    if (showTiles) {
      L.tileLayer(OSM_URL, { attribution: OSM_ATTRIBUTION, noWrap: false }).addTo(map);
    }

    let cancelled = false;

    loadCountryGeometry()
      .then((geo: CountryFeatureCollection) => {
        if (cancelled) return;
        const layer = L.geoJSON(geo, {
          style: (f) => polygonStyle((f as CountryFeature).id as string, stateRef.current),
          onEachFeature: (feature, lyr) => {
            const id = featureCountryId(feature as CountryFeature);
            if (!id) return;
            lyr.on('click', () => onSelectRef.current?.(id));
            const name = (feature as CountryFeature).properties?.name ?? id;
            if ('bindTooltip' in lyr) lyr.bindTooltip(name, { sticky: true });
          },
        }).addTo(map);
        layerRef.current = layer;

        if (!focusId) {
          const b = layer.getBounds();
          if (b.isValid()) map.fitBounds(b, { padding: [8, 8] });
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    // Keep sizing correct in responsive layouts.
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);

    return () => {
      cancelled = true;
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // Re-init only when interactivity/tiles change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, showTiles]);

  // Restyle when selection/discovered/mastered/highlighted change.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.eachLayer((lyr) => {
      const feature = (lyr as L.Layer & { feature?: CountryFeature }).feature;
      const id = feature ? featureCountryId(feature) : undefined;
      if (id && 'setStyle' in lyr) {
        (lyr as L.Path).setStyle(polygonStyle(id, stateInput));
      }
    });
    // stateInput is spread from props; depend on its parts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stateInput.selectedId,
    stateInput.discoveredIds,
    stateInput.masteredIds,
    stateInput.highlightedIds,
    ready,
  ]);

  // Fit to a specific country when asked. If it has no polygon (a micro-state too
  // small to draw), drop a marker at markerLatLng and centre on it instead, so the
  // country is still shown rather than leaving the whole world unhighlighted.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !focusId) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    let found = false;
    layer.eachLayer((lyr) => {
      const feature = (lyr as L.Layer & { feature?: CountryFeature }).feature;
      if (feature && featureCountryId(feature) === focusId) {
        found = true;
        const bounds = featureBounds(feature);
        if (bounds) map.fitBounds(bounds, { padding: [12, 12], maxZoom: 6 });
      }
    });

    if (!found && markerLatLng) {
      const marker = L.circleMarker(markerLatLng, {
        radius: 8,
        color: '#0d3f6e',
        weight: 3,
        fillColor: '#f5a623',
        fillOpacity: 1,
        className: 'country-pin',
      }).addTo(map);
      markerRef.current = marker;
      map.setView(markerLatLng, 5);
    }
  }, [focusId, markerLatLng, ready]);

  if (error) {
    return (
      <div className={className ? `world-map world-map--error ${className}` : 'world-map world-map--error'}>
        <p>The map couldn’t load right now. You can still play all the other games.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className ? `world-map ${className}` : 'world-map'}
      role="application"
      aria-label={ariaLabel}
    />
  );
}
