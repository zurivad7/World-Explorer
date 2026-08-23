import { useEffect, useState } from 'react';

/**
 * Track connectivity via the browser's online/offline events (PRD §18 graceful
 * offline state). Feature-detected and SSR-safe: assumes online when `navigator`
 * is unavailable. `navigator.onLine` only reflects network-interface state, so it
 * is a hint — the app never blocks on it, it just reassures the player.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    // Re-sync in case connectivity changed between initial render and effect.
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
