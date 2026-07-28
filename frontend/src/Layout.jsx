import { NavLink, Outlet } from 'react-router-dom';
import keycloak from './keycloak';

function Layout({ isAdmin, currentEmployee }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">⏱</span>
          <span className="brand-name">ClockSmart</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Attendance
          </NavLink>
          <NavLink to="/leave" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Leave Requests
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/assistant" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            AI Assistant
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {currentEmployee && (
            <div className="welcome">
              <span className="welcome-label">Signed in as</span>
              <span className="welcome-name">
                {currentEmployee.firstName} {currentEmployee.lastName}
              </span>
            </div>
          )}
          <button className="btn btn-ghost" onClick={() => keycloak.logout()}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;