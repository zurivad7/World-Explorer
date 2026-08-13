import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createProgress } from '@/lib/game-engine';
import {
  WorldExplorerDB,
  createDefaultProfile,
  getAllProgress,
  getProfile,
  getProgress,
  resetAll,
  saveProfile,
  saveProgress,
} from '@/lib/storage';

// Each test uses a fresh, isolated database instance.
function freshDb() {
  return new WorldExplorerDB(`test-${crypto.randomUUID()}`);
}

let dbs: WorldExplorerDB[] = [];
function track(db: WorldExplorerDB) {
  dbs.push(db);
  return db;
}

afterEach(async () => {
  await Promise.all(dbs.map((d) => d.delete()));
  dbs = [];
});

describe('createDefaultProfile', () => {
  it('creates a safe default profile with no PII', () => {
    const p = createDefaultProfile('5-7');
    expect(p.ageBand).toBe('5-7');
    expect(p.soundEnabled).toBe(true);
    expect(p.reducedMotion).toBe(false);
    expect(p.nickname).toBeUndefined();
    expect(p.schemaVersion).toBe(1);
  });
});

describe('profile persistence', () => {
  it('round-trips a single profile', async () => {
    const db = track(freshDb());
    expect(await getProfile(db)).toBeUndefined();

    const profile = { ...createDefaultProfile('8-10'), nickname: 'Explorer' };
    await saveProfile(profile, db);

    expect(await getProfile(db)).toEqual(profile);
  });

  it('keeps only one profile row', async () => {
    const db = track(freshDb());
    await saveProfile(createDefaultProfile('5-7'), db);
    await saveProfile(createDefaultProfile('11-13'), db);

    expect(await db.profile.count()).toBe(1);
    expect((await getProfile(db))?.ageBand).toBe('11-13');
  });
});

describe('progress persistence', () => {
  it('round-trips progress records', async () => {
    const db = track(freshDb());
    const progress = { ...createProgress('fr'), attempts: 3, correct: 2, masteryScore: 55 };
    await saveProgress(progress, db);

    expect(await getProgress('fr', db)).toEqual(progress);
    expect(await getAllProgress(db)).toHaveLength(1);
  });
});

describe('resetAll (FR-020)', () => {
  it('clears all local player data', async () => {
    const db = track(freshDb());
    await saveProfile(createDefaultProfile('8-10'), db);
    await saveProgress(createProgress('fr'), db);

    await resetAll(db);

    expect(await getProfile(db)).toBeUndefined();
    expect(await getAllProgress(db)).toHaveLength(0);
  });
});
