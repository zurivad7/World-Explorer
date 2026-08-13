import { Link, useParams } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { getCountryById } from '@/data';

/** S04 Country Detail — flag, capital, continent, region, facts (PRD §8, §13). */
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

  return (
    <Screen title={country.name} subtitle={`${country.continent} • ${country.region}`}>
      <dl className="detail-list">
        <div className="detail-list__row">
          <dt>Capital</dt>
          <dd>{country.capital}</dd>
        </div>
        <div className="detail-list__row">
          <dt>Continent</dt>
          <dd>{country.continent}</dd>
        </div>
      </dl>

      <h2 className="section-heading">Did you know?</h2>
      <ul className="fact-list">
        {country.facts.map((fact) => (
          <li key={fact.text}>{fact.text}</li>
        ))}
      </ul>

      <Link to={paths.play} className="button button--primary">
        Play this country
      </Link>
    </Screen>
  );
}
