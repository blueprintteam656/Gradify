import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  HelpCircle,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Search,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';

const WORKSPACE_NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Project & Team', to: '/projects', icon: Users, badge: 'Alpha' },
  { label: 'Kanban Board', to: '/tasks/kanban', icon: KanbanSquare },
  { label: 'Deliverables', to: '/tasks', icon: CheckSquare, badge: 'Phase 2' },
  { label: 'AI Assistant', to: '/ai-workspace/chat', icon: Sparkles, dot: 'bg-indigo-300' },
];

const COMMUNICATION_NAV = [
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell, dot: 'bg-red-500' },
  { label: 'Meetings & Schedule', to: '/collaboration/meetings', icon: CalendarDays },
  { label: 'Analytics & Audit', to: '/supervisor/analytics', icon: BarChart3 },
];

const formatRole = (role) => (role ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');

function SidebarItem({ item, active }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
        active
          ? 'bg-indigo-500 font-semibold text-white'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={15} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded bg-[#0f1d4a] px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
          {item.badge}
        </span>
      )}
      {item.dot && <span className={`size-1.5 rounded-full ${item.dot}`} />}
    </Link>
  );
}

function initialsOf(user) {
  const parts = (user?.name ?? '').trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '?';
}

// `active` = label of the sidebar item to highlight (the design highlights "Dashboard")
export default function ProfileShell({ active = 'Dashboard', children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#f3f5f9] text-slate-800">
      {/* ============ sidebar ============ */}
      <aside className="hidden w-[260px] shrink-0 flex-col overflow-y-auto bg-[#1b2559] p-4 lg:flex">
        <div className="mb-4 flex items-center gap-2 px-2 text-white">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
            <GraduationCap size={20} />
          </span>
          <span className="text-xl font-bold">Gradify</span>
          <span className="rounded bg-indigo-400/30 px-1.5 text-[10px] font-bold">AI</span>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-[10px] font-semibold tracking-wide text-slate-300">
          <span className="flex items-center gap-1.5">
            <GraduationCap size={12} />
            {currentUser?.role === 'Supervisor' ? 'SUPERVISOR VIEW' : 'STUDENT VIEW'}
          </span>
          <span>2026/27</span>
        </div>

        <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400">CORE WORKSPACE</p>
        <nav className="flex flex-col gap-1">
          {WORKSPACE_NAV.map((item) => (
            <SidebarItem key={item.label} item={item} active={item.label === active} />
          ))}
        </nav>

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold tracking-wider text-slate-400">COMMUNICATION</p>
        <nav className="flex flex-col gap-1">
          {COMMUNICATION_NAV.map((item) => (
            <SidebarItem key={item.label} item={item} active={item.label === active} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Link to="/profile" className="flex items-center gap-2.5 rounded-lg bg-white/10 p-2.5 text-white">
            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-200 text-xs font-bold text-slate-800">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="" className="size-full object-cover" />
              ) : (
                initialsOf(currentUser)
              )}
            </span>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-semibold">{currentUser?.name ?? 'Guest'}</p>
              <p className="truncate text-slate-400">{formatRole(currentUser?.role)}</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* ============ main ============ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <p className="hidden text-xs text-slate-500 md:block">
            Workspace › Account › <b className="text-slate-800">My Profile</b>
          </p>

          <label className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
            <Search size={14} />
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search projects, milestones, advisors..."
            />
            <kbd className="rounded bg-slate-200 px-1.5 text-[10px]">⌘K</kbd>
          </label>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="relative">
              <Bell size={17} />
              <i className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-red-500" />
            </span>
            <Sun size={17} />
            <HelpCircle size={17} />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}