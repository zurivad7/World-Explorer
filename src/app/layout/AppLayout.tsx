import { NavLink, Outlet } from 'react-router-dom';
import { primaryNav } from '@/app/routes';

/** App shell: a header, the routed screen, and a primary nav (PRD §21 — large touch targets). */
export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header__logo" aria-hidden="true">
          🌍
        </span>
        <span className="app-header__title">World Explorer</span>
      </header>

      <main className="app-main" id="main-content">
        <Outlet />
      </main>

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
    </div>
  );
}
