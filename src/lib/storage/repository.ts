import type { Profile, Progress } from '@/types';
import { PROFILE_KEY, SCHEMA_VERSION, db, type WorldExplorerDB } from './db';

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

/** Delete all local player data (PRD §11 FR-020 — reset from Settings). */
export async function resetAll(database: WorldExplorerDB = db): Promise<void> {
  await database.transaction('rw', database.profile, database.progress, async () => {
    await database.profile.clear();
    await database.progress.clear();
  });
}
