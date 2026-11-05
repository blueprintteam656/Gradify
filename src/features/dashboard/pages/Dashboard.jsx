
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Layers3,
  ListTodo,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useDashboard } from "../useDashboard";
import ProfileShell from "../../profile/components/ProfileShell";

const FILTERS = ["All Tasks", "In Progress", "In Review", "Completed"];

const STATUS = {
  TODO: ["To Do", "bg-slate-100 text-slate-600"],
  IN_PROGRESS: ["In Progress", "bg-blue-50 text-blue-700"],
  IN_REVIEW: ["In Review", "bg-amber-50 text-amber-700"],
  DONE: ["Completed", "bg-emerald-50 text-emerald-700"],
};

const PRIORITY = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
  CRITICAL: "bg-rose-100 text-rose-800",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function daysUntil(value) {
  const today = new Date();
  const due = new Date(value);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return Math.round((due - today) / 86400000);
}

function StatCard({ title, value, subtitle, icon: Icon, iconStyle, progress }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>
        <span className={`rounded-xl p-2.5 ${iconStyle}`}>
          <Icon size={18} />
        </span>
      </div>

      <h2 className="mt-3 text-3xl font-extrabold text-[#0f1d4a]">
        {value}
      </h2>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </article>
  );
}

function Section({ title, icon: Icon, action, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-3 py-4 sm:px-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#0f1d4a]">
          <Icon size={17} className="text-indigo-500" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { currentUser, projects, tasks, loading, error, refresh } = useDashboard();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Tasks");

  // The service returns projects already scoped to the signed-in student.
  // The backend must enforce access control; client filtering is not security.
  const myProjects = projects;

  const myProjectIds = useMemo(
    () => new Set(myProjects.map((project) => project.id)),
    [myProjects]
  );

  const projectTasks = useMemo(
    () => tasks.filter((task) => myProjectIds.has(task.projectId)),
    [tasks, myProjectIds]
  );

  const completed = projectTasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const pending = projectTasks.filter(
    (task) => task.status === "IN_REVIEW"
  ).length;

  const active = projectTasks.filter(
    (task) => task.status !== "DONE"
  ).length;

  const progress = projectTasks.length
    ? Math.round((completed / projectTasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase().trim();

    return projectTasks.filter((task) => {
      const project = myProjects.find(
        (p) => p.id === task.projectId
      );

      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        project?.name?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All Tasks" ||
        (filter === "In Progress" && task.status === "IN_PROGRESS") ||
        (filter === "In Review" && task.status === "IN_REVIEW") ||
        (filter === "Completed" && task.status === "DONE");

      return matchesSearch && matchesFilter;
    });
  }, [projectTasks, myProjects, search, filter]);

  const deadlines = useMemo(
    () =>
      projectTasks
        .filter((task) => task.status !== "DONE" && task.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4),
    [projectTasks]
  );

  const firstName =
    currentUser?.firstName ||
    currentUser?.name?.split(" ")[0] ||
    "Student";

  return (
    <ProfileShell active="Dashboard" pageTitle="Dashboard">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-6 sm:py-5">
        {/* HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              Workspace › <b className="text-slate-800">Dashboard</b>
            </p>

            <h1 className="mt-1 break-words text-xl font-bold text-[#0f1d4a] sm:text-2xl">
              Welcome back, {firstName}! 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening with your graduation projects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              aria-label="Refresh dashboard"
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
            </button>

            <Link
              to="/tasks/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-xs font-semibold text-white no-underline hover:bg-indigo-600"
            >
              <Plus size={15} />
              New Task
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            title="Overall Progress"
            value={`${progress}%`}
            subtitle={`${completed} of ${projectTasks.length} tasks completed`}
            icon={ArrowUpRight}
            iconStyle="bg-indigo-50 text-indigo-500"
            progress={progress}
          />

          <StatCard
            title="Tasks Completed"
            value={`${completed}/${projectTasks.length}`}
            subtitle="Completed project tasks"
            icon={CheckCircle2}
            iconStyle="bg-emerald-50 text-emerald-500"
            progress={progress}
          />

          <StatCard
            title="Active Deliverables"
            value={active}
            subtitle="Tasks awaiting completion"
            icon={Layers3}
            iconStyle="bg-blue-50 text-blue-500"
          />

          <StatCard
            title="Pending Approvals"
            value={pending}
            subtitle="Tasks awaiting review"
            icon={ShieldCheck}
            iconStyle="bg-amber-50 text-amber-500"
          />
        </div>

        {/* CONTENT */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
          <div className="min-w-0 space-y-5">
            {/* TASKS TABLE */}
            <Section
              title="Active Tasks & Milestones"
              icon={ListTodo}
              action={
                <Link
                  to="/tasks"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 no-underline"
                >
                  View All <ArrowRight size={13} />
                </Link>
              }
            >
              <div className="flex flex-col items-stretch gap-3 px-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
                <div className="flex w-full gap-1 overflow-x-auto pb-1 sm:w-auto">
                  {FILTERS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-semibold ${
                        filter === item
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <label className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:w-auto">
                  <Search size={14} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks..."
                    className="min-w-0 flex-1 bg-transparent text-xs outline-none sm:w-28"
                  />
                </label>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[590px] border-collapse text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] uppercase text-slate-400">
                      <th className="px-4 py-3">Task & Project</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Priority</th>
                      <th className="px-3 py-3">Due Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading &&
                      !error &&
                      filteredTasks.map((task) => {
                        const project = myProjects.find(
                          (p) => p.id === task.projectId
                        );

                        const status = STATUS[task.status] || STATUS.TODO;

                        return (
                          <tr
                            key={task.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-4">
                              <Link
                                to={`/tasks/${task.id}`}
                                className="block text-xs font-bold text-[#0f1d4a] no-underline hover:text-indigo-600"
                              >
                                {task.title}
                              </Link>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {project?.name || "Project"}
                              </p>
                            </td>

                            <td className="px-3 py-4">
                              <span
                                className={`rounded-md px-2 py-1 text-[10px] font-semibold ${status[1]}`}
                              >
                                {status[0]}
                              </span>
                            </td>

                            <td className="px-3 py-4">
                              <span
                                className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                                  PRIORITY[task.priority] || PRIORITY.LOW
                                }`}
                              >
                                {task.priority || "LOW"}
                              </span>
                            </td>

                            <td className="px-3 py-4 text-[11px] text-slate-500">
                              {formatDate(task.dueDate)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {(loading || error || filteredTasks.length === 0) && (
                  <p className="px-5 py-10 text-center text-xs text-slate-400">
                    {loading
                      ? "Loading tasks..."
                      : error || "No matching tasks found."}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-4 sm:px-5">
                <span className="text-xs text-slate-400">
                  Showing {filteredTasks.length} tasks
                </span>
                <Link
                  to="/tasks/kanban"
                  className="text-xs font-semibold text-indigo-600 no-underline"
                >
                  Open Kanban Board →
                </Link>
              </div>
            </Section>

            {/* PROJECTS */}
            <Section
              title="My Projects"
              icon={FolderKanban}
              action={
                <Link
                  to="/projects"
                  className="text-xs font-semibold text-indigo-600 no-underline"
                >
                  View All →
                </Link>
              }
            >
              <div className="grid min-w-0 gap-3 p-3 sm:grid-cols-2 sm:p-5">
                {myProjects.map((project) => {
                  const list = projectTasks.filter(
                    (task) => task.projectId === project.id
                  );
                  const done = list.filter(
                    (task) => task.status === "DONE"
                  ).length;
                  const percent = list.length
                    ? Math.round((done / list.length) * 100)
                    : 0;

                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="min-w-0 rounded-xl border border-slate-200 bg-[#f8f9fc] p-4 no-underline hover:bg-indigo-50"
                    >
                      <div className="flex items-center justify-between">
                        <FolderKanban size={18} className="text-indigo-500" />
                        <ArrowUpRight size={15} className="text-slate-400" />
                      </div>

                      <h3 className="mt-3 break-words text-sm font-bold text-[#0f1d4a]">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {done}/{list.length} tasks completed
                      </p>

                      <div className="mt-4 h-1.5 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}

                {!loading && myProjects.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No assigned projects yet.
                  </p>
                )}
              </div>
            </Section>
          </div>

          {/* RIGHT SIDE */}
          <aside className="min-w-0 space-y-5">
            <Section
              title="Supervisor Feedback"
              icon={MessageSquareText}
            >
              <div className="flex flex-col items-center px-5 py-9 text-center">
                <div className="rounded-full bg-indigo-50 p-3 text-indigo-500">
                  <MessageSquareText size={20} />
                </div>
                <p className="mt-3 text-xs font-bold text-[#0f1d4a]">
                  No feedback yet
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Supervisor feedback will appear here when available.
                </p>
              </div>
            </Section>

            <Section title="Upcoming Deadlines" icon={CalendarDays}>
              <div className="space-y-3 p-4">
                {deadlines.map((task) => {
                  const days = daysUntil(task.dueDate);

                  return (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="flex items-center gap-3 rounded-xl bg-[#f8f9fc] p-3 no-underline hover:bg-indigo-50"
                    >
                      <span className="rounded-lg bg-indigo-50 p-2 text-indigo-500">
                        <Clock3 size={17} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#0f1d4a]">
                          {task.title}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatDate(task.dueDate)}
                        </p>
                      </div>

                      <span className="shrink-0 text-[10px] font-bold text-indigo-600">
                        {days < 0
                          ? `${Math.abs(days)}d late`
                          : days === 0
                          ? "Today"
                          : `${days}d left`}
                      </span>
                    </Link>
                  );
                })}

                {!loading && deadlines.length === 0 && (
                  <p className="py-5 text-center text-xs text-slate-400">
                    No deadlines found.
                  </p>
                )}
              </div>
            </Section>

            {/* AI CARD */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1b2559] to-indigo-600 p-5 text-white shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={20} />
              </div>

              <h3 className="mt-4 text-base font-bold">
                AI Suggestions
              </h3>

              <p className="mt-2 text-xs leading-5 text-indigo-100">
                Explore AI-powered recommendations to improve
                your project workflow.
              </p>

              <Link
                to="/ai-workspace/recommendations"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 no-underline hover:bg-indigo-50"
              >
                Explore AI Insights
                <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </ProfileShell>
  );
}
