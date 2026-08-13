import { Suspense, lazy } from 'react';
import type { WorldMapProps } from './WorldMap';

const WorldMap = lazy(() => import('./WorldMap').then((m) => ({ default: m.WorldMap })));

/**
 * Code-split entry point for the map. Leaflet and the geometry only load when a
 * map is actually rendered, keeping the initial bundle small (PRD §23).
 */
export function LazyWorldMap(props: WorldMapProps) {
  return (
    <Suspense fallback={<div className="world-map world-map--loading">Loading map…</div>}>
      <WorldMap {...props} />
    </Suspense>
  );
}
