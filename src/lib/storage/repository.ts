import type { Profile, Progress } from '@/types';
import {
  PROFILE_KEY,
  SCHEMA_VERSION,
  STATS_KEY,
  db,
  type PlayerStats,
  type RecentActivity,
  type WorldExplorerDB,
} from './db';

const RECENT_ACTIVITY_LIMIT = 12;

export function emptyStats(): PlayerStats {
  return { gamesCompleted: 0, recentActivity: [] };
}

/**
 * Typed persistence API used by the rest of the app. UI and game code should
 * depend on these functions, never on Dexie directly — this keeps the storage
 * engine swappable and the logic testable.
 */

export function createDefaultProfile(ageBand: Profile['ageBand']): Profile {
  return {
    ageBand,
    soundEnabled: true,
    reducedMotion: false,
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
  };
}

export async function getProfile(database: WorldExplorerDB = db): Promise<Profile | undefined> {
  const row = await database.profile.get(PROFILE_KEY);
  if (!row) return undefined;
  const { id: _id, ...profile } = row;
  return profile;
}

export async function saveProfile(
  profile: Profile,
  database: WorldExplorerDB = db
): Promise<void> {
  await database.profile.put({ ...profile, id: PROFILE_KEY });
}

export async function getProgress(
  key: string,
  database: WorldExplorerDB = db
): Promise<Progress | undefined> {
  return database.progress.get(key);
}

export async function getAllProgress(database: WorldExplorerDB = db): Promise<Progress[]> {
  return database.progress.toArray();
}

export async function saveProgress(
  progress: Progress,
  database: WorldExplorerDB = db
): Promise<void> {
  await database.progress.put(progress);
}

export async function getStats(database: WorldExplorerDB = db): Promise<PlayerStats> {
  const row = await database.stats.get(STATS_KEY);
  if (!row) return emptyStats();
  const { id: _id, ...stats } = row;
  return stats;
}

export async function saveStats(stats: PlayerStats, database: WorldExplorerDB = db): Promise<void> {
  await database.stats.put({ ...stats, id: STATS_KEY });
}

/**
 * Record a completed game: bump the counter, prepend to recent activity, and (for
 * the daily challenge) stamp the day. Returns the updated stats.
 */
export async function recordGameCompleted(
  activity: RecentActivity,
  dailyDate: string | undefined,
  database: WorldExplorerDB = db
): Promise<PlayerStats> {
  const current = await getStats(database);
  const next: PlayerStats = {
    gamesCompleted: current.gamesCompleted + 1,
    recentActivity: [activity, ...current.recentActivity].slice(0, RECENT_ACTIVITY_LIMIT),
    ...(dailyDate ? { lastDailyDate: dailyDate } : current.lastDailyDate ? { lastDailyDate: current.lastDailyDate } : {}),
  };
  await saveStats(next, database);
  return next;
}

/** Delete all local player data (PRD §11 FR-020 — reset from Settings). */
export async function resetAll(database: WorldExplorerDB = db): Promise<void> {
  await database.transaction('rw', database.profile, database.progress, database.stats, async () => {
    await database.profile.clear();
    await database.progress.clear();
    await database.stats.clear();
  });
}
