import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/app/providers/ProfileProvider';
import { resetAll } from '@/lib/storage';

/** S11 Settings — sound, motion, age band, reset progress, privacy/about (PRD §13, FR-020). */
export function SettingsScreen() {
  const { profile, updateProfile } = useProfile();
  const [resetDone, setResetDone] = useState(false);

  async function handleReset() {
    await resetAll();
    setResetDone(true);
  }

  return (
    <Screen title="Settings">
      <div className="settings-group">
        <label className="toggle">
          <span>Sound</span>
          <input
            type="checkbox"
            checked={profile?.soundEnabled ?? true}
            onChange={(e) => void updateProfile({ soundEnabled: e.target.checked })}
          />
        </label>

        <label className="toggle">
          <span>Reduced motion</span>
          <input
            type="checkbox"
            checked={profile?.reducedMotion ?? false}
            onChange={(e) => void updateProfile({ reducedMotion: e.target.checked })}
          />
        </label>
      </div>

      <div className="settings-group">
        <h2 className="section-heading">Progress</h2>
        <button type="button" className="button button--danger" onClick={() => void handleReset()}>
          Reset all progress
        </button>
        {resetDone ? <p className="empty-state">Your local progress has been cleared.</p> : null}
      </div>

      <div className="settings-group">
        <h2 className="section-heading">About &amp; privacy</h2>
        <p className="empty-state">
          World Explorer has no ads and no chat. It never collects your location or personal
          details. Everything you do stays on this device.
        </p>
      </div>
    </Screen>
  );
}
