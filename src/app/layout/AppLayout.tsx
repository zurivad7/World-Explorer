import { Link, NavLink, Outlet } from 'react-router-dom';
import { paths, primaryNav } from '@/app/routes';
import { OfflineBanner } from '@/features/pwa/OfflineBanner';

/** App shell: a header (links home) with the primary nav on top, then the routed screen. */
export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to={paths.home} className="app-header__brand" aria-label="World Explorer — go to Home">
          <span className="app-header__logo" aria-hidden="true">
            🌍
          </span>
          <span className="app-header__title">World Explorer</span>
        </Link>
      </header>

      <nav className="app-nav" aria-label="Primary">
        {primaryNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
            }
            end={item.to === '/'}
          >
            <span className="app-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="app-nav__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <OfflineBanner />

      <main className="app-main" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
