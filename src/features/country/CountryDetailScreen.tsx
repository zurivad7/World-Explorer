import { Link, useParams } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { getCountryById } from '@/data';
import { assetUrl } from '@/lib/assets';
import { LazyWorldMap } from '@/features/map/LazyWorldMap';

/** S04 Country Detail — flag, capital, continent, region, neighbours, facts (PRD §8, §13). */
export function CountryDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const country = id ? getCountryById(id) : undefined;

  if (!country) {
    return (
      <Screen title="Country not found">
        <Link to={paths.map} className="button">
          Back to the map
        </Link>
      </Screen>
    );
  }

  const neighbours = country.neighbours
    .map((n) => getCountryById(n))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <Screen title={country.name} subtitle={`${country.continent} • ${country.region}`}>
      <img
        className="country-flag"
        src={assetUrl(country.flagAsset)}
        alt={`Flag of ${country.name}`}
        width={120}
        height={90}
        loading="lazy"
      />

      <LazyWorldMap
        focusId={country.id}
        highlightedIds={new Set([country.id])}
        ariaLabel={`Map showing where ${country.name} is`}
        className="world-map--detail"
      />

      <dl className="detail-list">
        <div className="detail-list__row">
          <dt>Capital</dt>
          <dd>{country.capital}</dd>
        </div>
        <div className="detail-list__row">
          <dt>Continent</dt>
          <dd>{country.continent}</dd>
        </div>
        <div className="detail-list__row">
          <dt>Region</dt>
          <dd>{country.region}</dd>
        </div>
      </dl>

      <h2 className="section-heading">Did you know?</h2>
      <ul className="fact-list">
        {country.facts.map((fact) => (
          <li key={fact.text}>{fact.text}</li>
        ))}
      </ul>

      {neighbours.length > 0 ? (
        <>
          <h2 className="section-heading">Neighbours</h2>
          <ul className="chip-list">
            {neighbours.map((n) => (
              <li key={n.id}>
                <Link to={paths.country(n.id)} className="chip">
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Link to={paths.play} className="button button--primary">
        Play this country
      </Link>
    </Screen>
  );
}
