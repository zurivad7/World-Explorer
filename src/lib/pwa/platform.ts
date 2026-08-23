/**
 * Pure PWA platform helpers (PRD §19). Kept side-effect free and injectable so the
 * install-guidance logic is unit-testable without a real browser. React hooks in
 * this folder call these with the live `window`/`navigator`.
 */

/** Which install-guidance a device needs. */
export type InstallPlatform = 'ios' | 'android' | 'other';

export interface PlatformInputs {
  userAgent: string;
  maxTouchPoints: number;
  /** navigator.platform, if available (helps spot iPadOS masquerading as Mac). */
  platform?: string | undefined;
}

/**
 * Detect the platform for install instructions. iPadOS 13+ reports itself as a Mac,
 * so a "Mac" that is touch-capable is treated as iOS (it installs via Add to Home
 * Screen, not the beforeinstallprompt flow).
 */
export function installPlatform({ userAgent, maxTouchPoints, platform }: PlatformInputs): InstallPlatform {
  const ua = userAgent.toLowerCase();
  const iOSLike = /iphone|ipad|ipod/.test(ua);
  const iPadOSAsMac = (platform === 'MacIntel' || /macintosh/.test(ua)) && maxTouchPoints > 1;
  if (iOSLike || iPadOSAsMac) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'other';
}

export interface StandaloneInputs {
  displayModeStandalone: boolean;
  /** navigator.standalone — non-standard, set by iOS Safari when launched from the home screen. */
  navigatorStandalone?: boolean | undefined;
}

/** True when the app is already running as an installed / standalone PWA. */
export function isStandalone({ displayModeStandalone, navigatorStandalone }: StandaloneInputs): boolean {
  return displayModeStandalone || navigatorStandalone === true;
}
