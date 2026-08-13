import { Screen } from '@/components/Screen';
import { CONTINENTS } from '@/types';

/** S08 Passport — continents, completion, country stamps (PRD §9, §13). Wired to real progress in Phase 5. */
export function PassportScreen() {
  return (
    <Screen title="My Passport" subtitle="Countries you have discovered will appear here.">
      <ul className="continent-progress">
        {CONTINENTS.filter((c) => c !== 'Antarctica').map((continent) => (
          <li key={continent} className="continent-progress__row">
            <span>{continent}</span>
            <span className="continent-progress__count">0 discovered</span>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
