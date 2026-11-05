import { NavLink } from "react-router-dom";
import { Activity } from "lucide-react";
import {
  GraduationCap,
  LayoutDashboard,
  UsersRound,
  KanbanSquare,
  ListChecks,
  Sparkles,
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

// Routes marked as new must be registered in your React Router configuration.
const workspaceItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Project & Team", icon: UsersRound, badge: "Alpha" },
  { to: "/tasks", label: "Kanban Board", icon: KanbanSquare },
  { to: "/deliverables", label: "Deliverables", icon: ListChecks, badge: "Phase 2", newRoute: true },
  { to: "/ai-workspace", label: "AI Assistant", icon: Sparkles, dot: true },
];

const communicationItems = [
  { to: "/notifications", label: "Notifications", icon: Bell, dot: true, dotColor: "bg-rose-500", newRoute: true },
  { to: "/meetings", label: "Meetings & Schedule", icon: CalendarDays, newRoute: true },
  {
  to: "/dashboard/recent-activity",
  label: "Recent Activity",
  icon: Activity,
},
  { to: "/analytics", label: "Analytics & Audit", icon: ChartNoAxesColumnIncreasing, newRoute: true },
];

function NavigationGroup({ title, items }) {
  return (
    <div className="mt-6">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7792C1]">
        {title}
      </p>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {items.map(({ to, label, icon: Icon, badge, dot, dotColor, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "group flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 py-2.5",
                  "text-[13px] font-semibold no-underline transition-colors duration-150",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A6A2FF]",
                  isActive
                    ? "bg-[#6057F5] text-white shadow-[0_4px_14px_rgba(68,58,180,0.16)]"
                    : "text-[#B8C7E7] hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <Icon size={17} strokeWidth={1.9} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {badge && (
                <span className="shrink-0 rounded bg-[#101D47] px-2 py-1 text-[10px] font-bold text-[#D7E2FF]">
                  {badge}
                </span>
              )}
              {dot && (
                <span
                  className={`h-[6px] w-[6px] shrink-0 rounded-full ${dotColor || "bg-[#A6A2FF]"}`}
                  aria-hidden="true"
                />
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-[#1B2858] px-3 pb-6 pt-5 text-white">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#303E75]">
          <GraduationCap size={21} strokeWidth={2} aria-hidden="true" />
        </div>
        <span className="text-[22px] font-extrabold tracking-tight">Gradify</span>
        <span className="rounded bg-[#354B9A] px-1.5 py-0.5 text-[10px] font-bold text-[#DDE4FF]">
          AI
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 rounded-lg bg-[#28376B] px-3 py-2 text-[10px] font-bold tracking-wide text-[#CFDAF4]">
        <span className="flex items-center gap-2">
          <GraduationCap size={13} aria-hidden="true" />
          STUDENT VIEW
        </span>
        <span>2026/27</span>
      </div>

      <nav aria-label="Student navigation" className="pb-4">
        <NavigationGroup title="Core Workspace" items={workspaceItems} />
        <NavigationGroup title="Communication" items={communicationItems} />
      </nav>
    </aside>
  );
}
