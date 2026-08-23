import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameMode, Progress, Question, Topic } from '@/types';
import {
  applyAnswer,
  createProgress,
  localDateKey,
  topicKey,
} from '@/lib/game-engine';
import {
  emptyStats,
  getAllProgress,
  getStats,
  recordGameCompleted as persistGameCompleted,
  resetAll,
  saveProgress,
  type PlayerStats,
} from '@/lib/storage';

const TOPIC_PREFIX = 'topic:';

interface ProgressContextValue {
  loading: boolean;
  /** All progress records keyed by country id or `topic:<topic>`. */
  progressByKey: ReadonlyMap<string, Progress>;
  stats: PlayerStats;
  discoveredCountryIds: ReadonlySet<string>;
  topicMastery: ReadonlyMap<Topic, number>;
  /** Mastery score for a country/topic key (start value if unseen). */
  masteryFor: (key: string) => number;
  /** Record one answered question (updates topic + country mastery and discovery). */
  recordAnswer: (question: Question, correct: boolean) => Promise<void>;
  /** Record a finished session (counter, recent activity, daily stamp). */
  recordGameCompleted: (mode: GameMode | 'daily', correct: number, total: number) => Promise<void>;
  /** Wipe all local player data (Settings → reset). */
  reset: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<Map<string, Progress>>(new Map());
  const [progressByKey, setProgressByKey] = useState<Map<string, Progress>>(new Map());
  const [stats, setStats] = useState<PlayerStats>(emptyStats());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getAllProgress(), getStats()])
      .then(([records, loadedStats]) => {
        if (!active) return;
        const map = new Map(records.map((r) => [r.key, r]));
        mapRef.current = map;
        setProgressByKey(new Map(map));
        setStats(loadedStats);
      })
      .catch(() => {
        // Storage unavailable (private mode) — the app still runs with empty progress.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const recordAnswer = useCallback(async (question: Question, correct: boolean) => {
    const now = new Date().toISOString();
    const map = mapRef.current;
    const toSave: Progress[] = [];

    const tKey = topicKey(question.topic);
    const nextTopic = applyAnswer(
      map.get(tKey) ?? createProgress(tKey),
      correct,
      question.difficulty,
      now
    );
    map.set(tKey, nextTopic);
    toSave.push(nextTopic);

    if (question.countryId) {
      const cKey = question.countryId;
      let nextCountry = applyAnswer(
        map.get(cKey) ?? createProgress(cKey),
        correct,
        question.difficulty,
        now
      );
      // A country becomes "discovered" the first time it's answered correctly.
      if (correct && !nextCountry.discoveredAt) {
        nextCountry = { ...nextCountry, discoveredAt: now };
      }
      map.set(cKey, nextCountry);
      toSave.push(nextCountry);
    }

    setProgressByKey(new Map(map));
    await Promise.all(toSave.map((p) => saveProgress(p)));
  }, []);

  const recordGameCompleted = useCallback(
    async (mode: GameMode | 'daily', correct: number, total: number) => {
      const dailyDate = mode === 'daily' ? localDateKey() : undefined;
      const next = await persistGameCompleted(
        { mode, correct, total, at: new Date().toISOString() },
        dailyDate
      );
      setStats(next);
    },
    []
  );

  const reset = useCallback(async () => {
    await resetAll();
    mapRef.current = new Map();
    setProgressByKey(new Map());
    setStats(emptyStats());
  }, []);

  const discoveredCountryIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [key, p] of progressByKey) {
      if (!key.startsWith(TOPIC_PREFIX) && p.discoveredAt) ids.add(key);
    }
    return ids;
  }, [progressByKey]);

  const topicMastery = useMemo(() => {
    const m = new Map<Topic, number>();
    for (const [key, p] of progressByKey) {
      if (key.startsWith(TOPIC_PREFIX)) m.set(key.slice(TOPIC_PREFIX.length) as Topic, p.masteryScore);
    }
    return m;
  }, [progressByKey]);

  const masteryFor = useCallback(
    (key: string) => progressByKey.get(key)?.masteryScore ?? createProgress(key).masteryScore,
    [progressByKey]
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      loading,
      progressByKey,
      stats,
      discoveredCountryIds,
      topicMastery,
      masteryFor,
      recordAnswer,
      recordGameCompleted,
      reset,
    }),
    [
      loading,
      progressByKey,
      stats,
      discoveredCountryIds,
      topicMastery,
      masteryFor,
      recordAnswer,
      recordGameCompleted,
      reset,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + its hook live together
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
