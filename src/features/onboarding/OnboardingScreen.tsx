import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';
import { AGE_BANDS, type AgeBand } from '@/types';

const AGE_LABELS: Record<AgeBand, string> = {
  '5-7': 'Ages 5–7',
  '8-10': 'Ages 8–10',
  '11-13': 'Ages 11–13',
};

/** S02 Onboarding — age band, optional nickname, brief safety note (PRD §13). */
export function OnboardingScreen() {
  const { initProfile } = useProfile();
  const navigate = useNavigate();
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [nickname, setNickname] = useState('');

  async function start() {
    if (!ageBand) return;
    await initProfile(ageBand, nickname);
    navigate(paths.home);
  }

  return (
    <Screen title="Let's get ready to explore!" subtitle="Choose how old you are so the games are just right.">
      <fieldset className="choice-group">
        <legend className="choice-group__legend">How old are you?</legend>
        {AGE_BANDS.map((band) => (
          <button
            key={band}
            type="button"
            className={ageBand === band ? 'choice choice--selected' : 'choice'}
            aria-pressed={ageBand === band}
            onClick={() => setAgeBand(band)}
          >
            {AGE_LABELS[band]}
          </button>
        ))}
      </fieldset>

      <label className="field">
        <span className="field__label">Nickname (optional)</span>
        <input
          className="field__input"
          type="text"
          value={nickname}
          maxLength={20}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Explorer"
        />
      </label>

      <p className="safety-note">
        No account needed. We don't ask for your name, location, or anything personal. Your progress
        stays on this device.
      </p>

      <button type="button" className="button button--primary" disabled={!ageBand} onClick={start}>
        Start exploring
      </button>
    </Screen>
  );
}
