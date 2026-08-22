import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProfileProvider, useProfile } from '@/app/providers/ProfileProvider';
import { AppLayout } from '@/app/layout/AppLayout';
import { paths } from '@/app/routes';
import { HomeScreen } from '@/features/home/HomeScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { MapScreen } from '@/features/map/MapScreen';
import { CountryDetailScreen } from '@/features/country/CountryDetailScreen';
import { GameHubScreen } from '@/features/games/GameHubScreen';
import { GameScreen } from '@/features/games/GameScreen';
import { PassportScreen } from '@/features/passport/PassportScreen';
import { AchievementsScreen } from '@/features/passport/AchievementsScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

/** Send first-time users through onboarding before the main app (PRD core experience §6). */
function RequireProfile({ children }: { children: ReactNode }) {
  const { profile, loading } = useProfile();
  if (loading) return <div className="loading">Loading…</div>;
  if (!profile) return <Navigate to={paths.onboarding} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={paths.onboarding} element={<OnboardingScreen />} />
      <Route
        element={
          <RequireProfile>
            <AppLayout />
          </RequireProfile>
        }
      >
        <Route path={paths.home} element={<HomeScreen />} />
        <Route path={paths.map} element={<MapScreen />} />
        <Route path={paths.countryPattern} element={<CountryDetailScreen />} />
        <Route path={paths.play} element={<GameHubScreen />} />
        <Route path={paths.gamePattern} element={<GameScreen />} />
        <Route path={paths.passport} element={<PassportScreen />} />
        <Route path={paths.achievements} element={<AchievementsScreen />} />
        <Route path={paths.progress} element={<ProgressScreen />} />
        <Route path={paths.settings} element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <ProfileProvider>
      <BrowserRouter
        basename={import.meta.env.BASE_URL}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRoutes />
      </BrowserRouter>
    </ProfileProvider>
  );
}
