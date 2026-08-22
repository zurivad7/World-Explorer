import type { GameMode } from '@/types';

/** Central route table so navigation stays type-safe and screens map 1:1 to PRD §13. */
export const paths = {
  home: '/', // S01
  onboarding: '/onboarding', // S02
  map: '/map', // S03
  country: (id: string) => `/country/${id}`, // S04
  countryPattern: '/country/:id',
  play: '/play', // S05 Game Hub
  game: (mode: GameMode) => `/play/${mode}`, // S06 / S07
  gamePattern: '/play/:mode',
  dailyChallenge: '/play/daily', // FR-015
  passport: '/passport', // S08
  achievements: '/achievements', // S09
  progress: '/progress', // S10
  settings: '/settings', // S11
} as const;

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

/** Primary bottom/side navigation (kept short and uncluttered per PRD S01). */
export const primaryNav: NavItem[] = [
  { to: paths.home, label: 'Home', icon: '🏠' },
  { to: paths.map, label: 'Explore', icon: '🗺️' },
  { to: paths.play, label: 'Play', icon: '🎮' },
  { to: paths.passport, label: 'Passport', icon: '🛂' },
  { to: paths.settings, label: 'Settings', icon: '⚙️' },
];
