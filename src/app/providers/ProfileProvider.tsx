import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AgeBand, Profile } from '@/types';
import { createDefaultProfile, getProfile, saveProfile } from '@/lib/storage';

interface ProfileContextValue {
  profile: Profile | undefined;
  loading: boolean;
  /** Create/replace the local profile (used by onboarding). */
  initProfile: (ageBand: AgeBand, nickname?: string) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((p) => {
        if (active) setProfile(p);
      })
      .catch(() => {
        // Local storage unavailable (e.g. private mode); the app still runs.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const initProfile = useCallback(async (ageBand: AgeBand, nickname?: string) => {
    const next: Profile = { ...createDefaultProfile(ageBand) };
    if (nickname && nickname.trim()) next.nickname = nickname.trim();
    await saveProfile(next);
    setProfile(next);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      setProfile((current) => {
        if (!current) return current;
        const next = { ...current, ...patch };
        void saveProfile(next);
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ profile, loading, initProfile, updateProfile }),
    [profile, loading, initProfile, updateProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + its hook live together
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
