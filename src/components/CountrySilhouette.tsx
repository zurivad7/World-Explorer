import shapesJson from '@/data/geometry/shapes.generated.json';

interface Silhouette {
  id: string;
  path: string;
  width: number;
  height: number;
}

const byId = new Map((shapesJson as Silhouette[]).map((s) => [s.id, s]));

interface CountrySilhouetteProps {
  id: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * A country's outline as a normalized inline SVG — just the shape, no basemap,
 * labels or neighbours. Renders nothing if the country has no silhouette.
 */
export function CountrySilhouette({
  id,
  ariaLabel = 'Country outline to identify',
  className,
}: CountrySilhouetteProps) {
  const shape = byId.get(id);
  if (!shape) return null;
  return (
    <svg
      className={className ? `country-silhouette ${className}` : 'country-silhouette'}
      viewBox={`0 0 ${shape.width} ${shape.height}`}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={shape.path} fillRule="evenodd" />
    </svg>
  );
}
