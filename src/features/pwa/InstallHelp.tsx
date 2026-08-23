import { useState } from 'react';
import { useInstallPrompt } from '@/lib/pwa';

/** Platform-specific manual "add to home screen" steps (PRD §19). */
function manualSteps(platform: 'ios' | 'android' | 'other'): string {
  switch (platform) {
    case 'ios':
      return 'In Safari, tap the Share button (the square with an arrow), then choose “Add to Home Screen”.';
    case 'android':
      return 'In Chrome, tap the ⋮ menu, then choose “Install app” or “Add to Home screen”.';
    case 'other':
    default:
      return 'Look for an install icon in your browser’s address bar, or open the browser menu and choose “Install World Explorer”.';
  }
}

/**
 * Installation help for Settings (PRD §19, S11). Offers a one-tap install where the
 * browser supports the prompt (Android/desktop Chromium) and always shows manual
 * steps as a feature-detected fallback; on iOS, where the prompt never fires,
 * manual steps are the whole story.
 */
export function InstallHelp() {
  const { platform, installed, canPrompt, promptInstall } = useInstallPrompt();
  const [outcome, setOutcome] = useState<'accepted' | 'dismissed' | null>(null);

  if (installed) {
    return (
      <p className="install-help__done">
        <span aria-hidden="true">✅ </span>
        World Explorer is installed on this device. Open it from your home screen any time —
        it works even without internet.
      </p>
    );
  }

  async function handleInstall() {
    const result = await promptInstall();
    if (result === 'accepted' || result === 'dismissed') setOutcome(result);
  }

  return (
    <div className="install-help">
      <p>
        Install World Explorer to launch it like an app — full screen, on your home screen, and
        playable offline.
      </p>

      {canPrompt ? (
        <button type="button" className="button button--primary" onClick={() => void handleInstall()}>
          Install app
        </button>
      ) : null}

      {outcome === 'dismissed' ? (
        <p className="install-help__note">No problem — you can install any time from here.</p>
      ) : null}

      <p className="install-help__steps">
        <strong>On this device:</strong> {manualSteps(platform)}
      </p>
    </div>
  );
}
