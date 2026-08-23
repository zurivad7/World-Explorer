import Dexie, { type Table } from 'dexie';
import type { GameMode, Profile, Progress } from '@/types';

/** Current profile schema version (PRD §14 schemaVersion). */
export const SCHEMA_VERSION = 1;

/** Fixed key for the single local profile / stats row. */
export const PROFILE_KEY = 'local';
export const STATS_KEY = 'local';

interface ProfileRow extends Profile {
  id: string; // always PROFILE_KEY — one local profile per device
}

/** A recently-played session, for the Progress screen. */
export interface RecentActivity {
  mode: GameMode | 'daily' | 'country' | 'speedrun';
  correct: number;
  total: number;
  at: string; // ISO date-time
}

/** Aggregate play stats (single local row). */
export interface PlayerStats {
  gamesCompleted: number;
  /** Local date (YYYY-MM-DD) the daily challenge was last completed. */
  lastDailyDate?: string;
  recentActivity: RecentActivity[];
}

interface StatsRow extends PlayerStats {
  id: string; // always STATS_KEY
}

/**
 * Local-first persistence (PRD §20). Player state lives entirely on-device in
 * IndexedDB; there is no backend and no cloud sync in the MVP.
 */
export class WorldExplorerDB extends Dexie {
  profile!: Table<ProfileRow, string>;
  progress!: Table<Progress, string>;
  stats!: Table<StatsRow, string>;

  constructor(name = 'world-explorer') {
    super(name);
    this.version(1).stores({
      profile: 'id',
      progress: 'key, masteryScore, lastPlayedAt',
    });
    // v2 adds the aggregate stats store (Phase 5).
    this.version(2).stores({
      profile: 'id',
      progress: 'key, masteryScore, lastPlayedAt',
      stats: 'id',
    });
  }
}

export const db = new WorldExplorerDB();
export type { ProfileRow, StatsRow };
