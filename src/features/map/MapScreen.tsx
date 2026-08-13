import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { countries } from '@/data';

/**
 * S03 World Map — placeholder. The interactive Leaflet map with a provider
 * abstraction is built in Phase 2 (PRD §16). For now, list seed countries so
 * navigation to Country Detail works and non-map play never depends on tiles.
 */
export function MapScreen() {
  return (
    <Screen title="Explore the World" subtitle="Tap a country to learn about it.">
      <div className="map-placeholder" role="img" aria-label="World map coming soon">
        🗺️ Interactive map arrives in Phase 2
      </div>
      <ul className="country-list">
        {countries.map((c) => (
          <li key={c.id}>
            <Link to={paths.country(c.id)} className="country-list__item">
              <span className="country-list__name">{c.name}</span>
              <span className="country-list__continent">{c.continent}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
