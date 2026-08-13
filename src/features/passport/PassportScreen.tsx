import { Screen } from '@/components/Screen';
import { getCountriesByContinent } from '@/data';
import { CONTINENTS } from '@/types';

/**
 * S08 Passport — continents and completion (PRD §9, §13). Totals come from the
 * dataset; discovered counts are wired to real progress in Phase 5.
 */
export function PassportScreen() {
  const byContinent = getCountriesByContinent();

  return (
    <Screen title="My Passport" subtitle="Countries you discover will appear here.">
      <ul className="continent-progress">
        {CONTINENTS.map((continent) => {
          const total = byContinent.get(continent)?.length ?? 0;
          if (total === 0) return null;
          return (
            <li key={continent} className="continent-progress__row">
              <span>{continent}</span>
              <span className="continent-progress__count">0 / {total} discovered</span>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
