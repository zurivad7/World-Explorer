import { Screen } from '@/components/Screen';
import { useProfile } from '@/app/providers/ProfileProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import { InstallHelp } from '@/features/pwa/InstallHelp';

/** S11 Settings — sound, motion, age band, reset progress, privacy/about (PRD §13, FR-020). */
export function SettingsScreen() {
  const { profile, updateProfile } = useProfile();
  const { reset } = useProgress();

  async function handleReset() {
    if (!window.confirm('Delete all progress and start over? This cannot be undone.')) return;
    await reset();
    // Reload for a clean slate (back to onboarding, since the profile is cleared too).
    window.location.assign(import.meta.env.BASE_URL);
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
        <h2 className="section-heading">Install on this device</h2>
        <InstallHelp />
      </div>

      <div className="settings-group">
        <h2 className="section-heading">Progress</h2>
        <button type="button" className="button button--danger" onClick={() => void handleReset()}>
          Reset all progress
        </button>
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
