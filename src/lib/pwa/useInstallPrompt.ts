import { useCallback, useEffect, useState } from 'react';
import { installPlatform, isStandalone, type InstallPlatform } from './platform';

/** The non-standard install-prompt event (Chromium). Not in lib.dom typings. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type PromptOutcome = 'accepted' | 'dismissed' | 'unavailable';

export interface InstallState {
  /** Platform for install guidance ('ios' installs manually, others may prompt). */
  platform: InstallPlatform;
  /** Already running as an installed / standalone PWA. */
  installed: boolean;
  /** A deferred beforeinstallprompt is captured, so a one-tap Install button works. */
  canPrompt: boolean;
  /** Trigger the native install prompt; resolves with the user's choice. */
  promptInstall: () => Promise<PromptOutcome>;
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'other';
  return installPlatform({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    platform: navigator.platform,
  });
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return isStandalone({
    displayModeStandalone: window.matchMedia?.('(display-mode: standalone)').matches ?? false,
    navigatorStandalone: (navigator as Navigator & { standalone?: boolean }).standalone,
  });
}

/**
 * Capture the browser's install prompt where supported and expose install state,
 * feature-detected (PRD §19 — never assume identical PWA support). On iOS the
 * beforeinstallprompt event does not fire; callers show manual Add-to-Home-Screen
 * guidance instead, driven by `platform`.
 */
export function useInstallPrompt(): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(detectStandalone);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Stop Chrome's mini-infobar so we can offer install from Settings instead.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<PromptOutcome> => {
    if (!deferred) return 'unavailable';
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    // A prompt can only be used once; drop it whatever the outcome.
    setDeferred(null);
    return outcome;
  }, [deferred]);

  return { platform: detectPlatform(), installed, canPrompt: deferred !== null, promptInstall };
}
