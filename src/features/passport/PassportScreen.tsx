import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { getCountriesByContinent } from '@/data';
import { assetUrl } from '@/lib/assets';
import { useProgress } from '@/app/providers/ProgressProvider';
import { CONTINENTS } from '@/types';

/**
 * S08 Passport — continents, completion progress, and country "stamps" (PRD §9, §13).
 * Reads discovered countries from persisted progress.
 */
export function PassportScreen() {
  const { discoveredCountryIds } = useProgress();
  const byContinent = getCountriesByContinent();

  const discoveredCountries = [...byContinent.values()]
    .flat()
    .filter((c) => discoveredCountryIds.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const total = [...byContinent.values()].reduce((n, list) => n + list.length, 0);

  return (
    <Screen
      title="My Passport"
      subtitle={`You have discovered ${discoveredCountryIds.size} of ${total} countries.`}
    >
      <div className="filter-row">
        <Link to={paths.achievements} className="chip">
          🏅 Badges
        </Link>
        <Link to={paths.progress} className="chip">
          📈 My Progress
        </Link>
      </div>

      <ul className="continent-progress">
        {CONTINENTS.map((continent) => {
          const countries = byContinent.get(continent) ?? [];
          if (countries.length === 0) return null;
          const found = countries.filter((c) => discoveredCountryIds.has(c.id)).length;
          const pct = Math.round((found / countries.length) * 100);
          return (
            <li key={continent} className="continent-progress__row">
              <div className="continent-progress__head">
                <span>{continent}</span>
                <span className="continent-progress__count">
                  {found} / {countries.length}
                </span>
              </div>
              <div className="mini-bar">
                <div className="mini-bar__fill" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="section-heading">Stamps</h2>
      {discoveredCountries.length === 0 ? (
        <p className="empty-state">
          Answer questions correctly to earn a stamp for each country you discover.{' '}
          <Link to={paths.play}>Play a game →</Link>
        </p>
      ) : (
        <div className="stamp-grid">
          {discoveredCountries.map((c) => (
            <Link key={c.id} to={paths.country(c.id)} className="stamp" title={c.name}>
              <img src={assetUrl(c.flagAsset)} alt="" width={44} height={33} loading="lazy" />
              <span className="stamp__name">{c.name}</span>
            </Link>
          ))}
        </div>
      )}
    </Screen>
  );
}
