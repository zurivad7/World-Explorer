import { useOnlineStatus } from '@/lib/pwa';

/**
 * A calm, reassuring banner shown only while the device is offline (PRD §18, §20).
 * Core non-map games and the map are precached, so play continues — this just tells
 * the child (and a watching parent) that nothing is broken.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="offline-banner" role="status">
      <span className="offline-banner__icon" aria-hidden="true">
        📴
      </span>
      <span>You’re offline — you can still play and explore. Progress saves on this device.</span>
    </div>
  );
}
