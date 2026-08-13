import { Link } from 'react-router-dom';
import { Screen } from '@/components/Screen';
import { paths } from '@/app/routes';
import { useProfile } from '@/app/providers/ProfileProvider';

const tiles = [
  { to: paths.map, label: 'Explore World', icon: '🗺️' },
  { to: paths.play, label: 'Play', icon: '🎮' },
  { to: paths.passport, label: 'Passport', icon: '🛂' },
  { to: paths.play, label: 'Daily Challenge', icon: '⭐' },
];

/** S01 Home — Explore, Play, Passport, Daily Challenge. Uncluttered (PRD §13). */
export function HomeScreen() {
  const { profile } = useProfile();
  const greeting = profile?.nickname ? `Welcome back, ${profile.nickname}!` : 'Welcome, Explorer!';

  return (
    <Screen title={greeting} subtitle="Explore the world. Discover countries. Earn your passport.">
      <div className="tile-grid">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to} className="tile">
            <span className="tile__icon" aria-hidden="true">
              {tile.icon}
            </span>
            <span className="tile__label">{tile.label}</span>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
