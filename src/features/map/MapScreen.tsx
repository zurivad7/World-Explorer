import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { countries } from '@/data';
import { CONTINENTS, type Continent } from '@/types';

/**
 * S03 World Map — Phase 1 shows a searchable, filterable country list with flags
 * so Explore → Country Detail works. The interactive Leaflet map (with the same
 * data behind it) arrives in Phase 2; basic browsing never depends on tiles.
 */
export function MapScreen() {
  const [continent, setContinent] = useState<Continent | 'all'>('all');
  const [query, setQuery] = useState('');

  const usedContinents = useMemo(
    () => CONTINENTS.filter((c) => countries.some((country) => country.continent === c)),
    []
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return countries
      .filter((c) => continent === 'all' || c.continent === continent)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [continent, query]);

  return (
    <Screen title="Explore the World" subtitle="Tap a country to learn about it.">
      <div className="map-placeholder" role="note">
        🗺️ The interactive map arrives in Phase 2. For now, browse below.
      </div>

      <label className="field">
        <span className="field__label">Search countries</span>
        <input
          className="field__input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Country or capital…"
        />
      </label>

      <div className="filter-row" role="group" aria-label="Filter by continent">
        <button
          type="button"
          className={continent === 'all' ? 'chip chip--selected' : 'chip'}
          aria-pressed={continent === 'all'}
          onClick={() => setContinent('all')}
        >
          All
        </button>
        {usedContinents.map((c) => (
          <button
            key={c}
            type="button"
            className={continent === c ? 'chip chip--selected' : 'chip'}
            aria-pressed={continent === c}
            onClick={() => setContinent(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="result-count">{visible.length} countries</p>

      <ul className="country-list">
        {visible.map((c) => (
          <li key={c.id}>
            <Link to={paths.country(c.id)} className="country-list__item">
              <img
                className="country-list__flag"
                src={c.flagAsset}
                alt=""
                width={32}
                height={24}
                loading="lazy"
              />
              <span className="country-list__name">{c.name}</span>
              <span className="country-list__continent">{c.continent}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
