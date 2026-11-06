
import { Link } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

export default function Navbar() {
  const { currentUser, logout, switchRole } = useAuth();

  return (
    <nav className="flex min-h-[68px] min-w-0 items-center justify-between gap-2 px-2 sm:gap-4 sm:px-6">
      {/* Brand */}
      <Link
        to="/"
        className="shrink-0 text-base font-extrabold text-[#1B2858] no-underline sm:text-xl"
      >
        Gradify
      </Link>

      {/* Actions */}
      <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-4">
        {currentUser && (
          <select
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value)}
            title="Dev: Switch Role"
            aria-label="Switch role"
            className="max-w-[75px] rounded-lg border border-[#E8ECF5] bg-white px-1 py-2 text-xs text-[#1B2858] sm:max-w-none sm:px-3 sm:text-sm"
          >
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        )}

        <div className="shrink-0">
          <ThemeToggle />
        </div>

        {currentUser && (
          <>
            {/* Settings Button */}
            <Link
              to="/profile/settings"
              title="Settings"
              aria-label="Settings"
              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-[#1B2858] no-underline transition-colors hover:bg-[#F2F4FF]"
            >
              <Settings size={19} />
              <span className="hidden md:inline">Settings</span>
            </Link>

            {/* User Name */}
            <span className="hidden max-w-[220px] truncate text-sm font-medium text-[#1B2858] lg:block">
              {currentUser.name} ({currentUser.role})
            </span>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E8ECF5] bg-white px-2 py-2 text-sm font-semibold text-[#1B2858] transition-colors hover:bg-[#F2F4FF] sm:px-3"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
