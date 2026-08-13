import Dexie, { type Table } from 'dexie';
import type { Profile, Progress } from '@/types';

/** Current local schema version. Bumping this drives Dexie migrations (PRD §14 schemaVersion). */
export const SCHEMA_VERSION = 1;

/** Fixed key for the single local profile row. */
export const PROFILE_KEY = 'local';

interface ProfileRow extends Profile {
  id: string; // always PROFILE_KEY — one local profile per device
}

/**
 * Local-first persistence (PRD §20). Player state lives entirely on-device in
 * IndexedDB; there is no backend and no cloud sync in the MVP.
 */
export class WorldExplorerDB extends Dexie {
  profile!: Table<ProfileRow, string>;
  progress!: Table<Progress, string>;

  constructor(name = 'world-explorer') {
    super(name);
    this.version(SCHEMA_VERSION).stores({
      // primary keys / indexes only — full row shape comes from the TS types above.
      profile: 'id',
      progress: 'key, masteryScore, lastPlayedAt',
    });
  }
}

export const db = new WorldExplorerDB();
export type { ProfileRow };
