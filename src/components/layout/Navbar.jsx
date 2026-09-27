import { Link } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';

export default function Navbar() {
  const { currentUser, logout, switchRole } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Gradify</Link>
      </div>
      <div className="navbar-actions">
        {/* Dev-only role switcher */}
        {currentUser && (
          <select
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value)}
            title="Dev: Switch Role"
          >
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}
        <ThemeToggle />
        {currentUser && (
          <>
            <span>{currentUser.name} ({currentUser.role})</span>
            <button type="button" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
