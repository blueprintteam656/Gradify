import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  Landmark,
  Link2,
  Lock,
  Mail,
  Pencil,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';
import { getProjects } from '../../../services/mock/mockProjectsService';
import { getTasks } from '../../../services/mock/mockTasksService';
import ProfileShell from '../components/ProfileShell';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DOT_COLORS = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-slate-700', 'bg-amber-500'];

const PROJECT_STATUS = {
  ON_TRACK: { label: 'On Track', className: 'bg-emerald-100 text-emerald-700' },
  BEHIND_SCHEDULE: { label: 'Behind Schedule', className: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-200 text-slate-700' },
};

const formatRole = (role) => (role ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');
const formatDate = (iso) =>
  iso ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso)) : '—';

function getNames(user) {
  if (user?.firstName) return [user.firstName, user.lastName ?? ''];
  const [first = '', ...rest] = (user?.name ?? '').trim().split(/\s+/);
  return [first, rest.join(' ')];
}

/** Everything on the "Performance Overview" card is computed from the user's assigned tasks. */
function computeStats(tasks, userId) {
  const now = Date.now();
  const mine = tasks.filter((t) => t.assigneeId === userId);
  const done = mine.filter((t) => t.status === 'DONE');
  const active = mine.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW');
  const overdue = mine.filter(
    (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate).getTime() < now,
  );

  // Completed tasks per week for the last 8 weeks (completedAt if it exists, otherwise the due date)
  const weekly = Array(8).fill(0);
  done.forEach((t) => {
    const date = new Date(t.completedAt ?? t.dueDate ?? t.createdAt).getTime();
    const weeksAgo = Math.max(0, Math.floor((now - date) / WEEK_MS));
    if (weeksAgo < 8) weekly[7 - weeksAgo] += 1;
  });

  return {
    total: mine.length,
    done: done.length,
    active: active.length,
    overdue: overdue.length,
    rate: mine.length ? Math.round((done.length / mine.length) * 100) : 0,
    weekly,
  };
}

function projectProgress(project, tasks) {
  if (project.status === 'COMPLETED') return 100;
  const list = tasks.filter((t) => t.projectId === project.id);
  if (!list.length) return 0;
  return Math.round((list.filter((t) => t.status === 'DONE').length / list.length) * 100);
}

function ReadOnlyField({ label, value, icon, mono, iconClass = 'text-slate-400' }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex min-h-[42px] items-center justify-between gap-2 rounded-lg bg-[#f3f1ee] px-3 py-2 text-sm font-medium text-slate-800">
        <span className={`min-w-0 truncate ${mono ? 'font-mono text-[13px]' : ''}`}>{value || '—'}</span>
        <span className={`shrink-0 ${iconClass}`}>{icon}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, note, valueClass = 'text-slate-900', noteClass = 'text-slate-500' }) {
  return (
    <div className="rounded-xl bg-[#f3f1ee] p-3.5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</p>
      {note && <p className={`mt-0.5 text-[11px] ${noteClass}`}>{note}</p>}
    </div>
  );
}

function Sparkline({ values }) {
  if (!values.some((v) => v > 0)) {
    return <p className="mt-2 rounded-lg bg-[#f3f1ee] p-3 text-xs text-slate-500">No completed tasks in the last 8 weeks.</p>;
  }

  const max = Math.max(...values);
  const step = 100 / (values.length - 1);
  const coords = values.map((v, i) => `${i * step},${27 - (v / max) * 22}`);

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-14 w-full rounded-lg bg-[#f3f1ee]">
      <polygon points={`0,30 ${coords.join(' ')} 100,30`} fill="#c7d2fe" fillOpacity="0.5" />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="#4f46e5"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function UserProfile() {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;

    Promise.all([getProjects(), getTasks()])
      .then(([projectList, taskList]) => {
        if (!alive) return;
        setProjects(projectList);
        setTasks(taskList);
      })
      .catch((error) => alive && setLoadError(error.message || 'Failed to load projects and tasks.'))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const userId = currentUser?.id;
  const stats = useMemo(() => computeStats(tasks, userId), [tasks, userId]);
  const myProjects = useMemo(
    () => projects.filter((p) => p.ownerId === userId || p.members?.includes(userId)),
    [projects, userId],
  );

  if (!currentUser) {
    return <p className="p-6 text-sm text-slate-600">Failed to load profile. User not found.</p>;
  }

  const academic = currentUser.academic ?? {};
  const [firstName, lastName] = getNames(currentUser);
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  const skills = currentUser.skills ?? [];
  const activeProjects = myProjects.filter((p) => p.status !== 'COMPLETED');
  const completedProjects = myProjects.filter((p) => p.status === 'COMPLETED');
  const featured = activeProjects[0];
  const otherProjects = [...activeProjects.slice(1), ...completedProjects];

  const cardClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

  return (
    <ProfileShell active="Dashboard">
      <div className="mx-auto w-full max-w-6xl px-6 py-5">
        {/* header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              Dashboard › <b className="text-slate-800">My Profile</b>
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0f1d4a]">My Profile</h1>
              {academic.academicId && (
                <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  ID: {academic.academicId}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage your personal information, verified competencies, and active graduation milestones.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
            <p className="text-slate-500">Account Status</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-slate-900">
              <span className={`size-2 rounded-full ${currentUser.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {currentUser.isVerified ? 'Verified • Active' : 'Pending Verification'}
            </p>
          </div>
        </div>

        {/* hero */}
        <section
          className={`${cardClass} flex flex-wrap items-center justify-between gap-5 bg-gradient-to-r from-white via-white to-indigo-50`}
        >
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-indigo-200 bg-white text-3xl font-bold text-[#1b2559]">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={fullName} className="size-full object-cover" />
                ) : initials ? (
                  initials
                ) : (
                  <UserRound size={40} />
                )}
              </div>
              {currentUser.isVerified && (
                <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                  <CheckCircle2 size={12} />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{fullName || '—'}</h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#2a1458] px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Users size={11} />
                  {formatRole(currentUser.role)}
                </span>
                {academic.graduationYear && (
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    Senior Class {academic.graduationYear}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {currentUser.email}
                </span>
                {academic.faculty && (
                  <span className="flex items-center gap-1.5">
                    <Landmark size={14} className="text-slate-400" />
                    {academic.faculty}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/profile/change-password"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#f3f1ee] px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-[#e9e6e1]"
            >
              <Link2 size={14} />
              Change Password
            </Link>
            <Link
              to="/profile/edit"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f1d4a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1b2a66]"
            >
              <Pencil size={14} />
              Edit Profile
            </Link>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
          {/* ---------------- left ---------------- */}
          <div className="flex flex-col gap-5">
            <section className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ClipboardList size={18} className="mt-0.5 text-[#1b2559]" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Personal &amp; Academic Records</h2>
                    <p className="text-xs text-slate-500">
                      Official information verified with the university registrar system.
                    </p>
                  </div>
                </div>
                <span className="rounded bg-[#f3f1ee] px-2 py-1 font-mono text-[10px] font-semibold text-slate-500">
                  READ-ONLY
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ReadOnlyField label="Full legal name" value={fullName} icon={<Lock size={12} />} />
                <ReadOnlyField label="University email" value={currentUser.email} icon={<Lock size={12} />} />
                <ReadOnlyField
                  label="Portal username"
                  value={currentUser.username ? `@${currentUser.username}` : ''}
                  icon={<Lock size={12} />}
                  mono
                />
                <ReadOnlyField
                  label="Phone contact"
                  value={currentUser.phone}
                  icon={<Smartphone size={13} />}
                  iconClass="text-emerald-500"
                />
                <ReadOnlyField
                  label="Academic student ID"
                  value={academic.academicId}
                  icon={<CheckCircle2 size={13} />}
                  mono
                />
                <ReadOnlyField
                  label="Graduation class"
                  value={academic.graduationYear ? `Class of ${academic.graduationYear}` : ''}
                  icon={<GraduationCap size={14} />}
                  iconClass="text-indigo-500"
                />
                <div className="sm:col-span-2">
                  <ReadOnlyField
                    label="University affiliation"
                    value={academic.university}
                    icon={<Building2 size={13} />}
                  />
                </div>
                <ReadOnlyField label="Department" value={academic.department} icon={<Building2 size={13} />} />
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={18} className="mt-0.5 text-[#1b2559]" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Technical Skills &amp; Competencies</h2>
                    <p className="max-w-xs text-xs text-slate-500">
                      Skills shown to your supervisor and teammates.
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile/edit"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-[#f3f1ee] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#e9e6e1]"
                >
                  <Pencil size={12} />
                  Manage Skills
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {skills.length ? (
                  skills.map((skill, index) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-[#f3f1ee] px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      <span className={`size-1.5 rounded-full ${DOT_COLORS[index % DOT_COLORS.length]}`} />
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No skills added yet. Use “Manage Skills” to add some.</p>
                )}
              </div>
            </section>
          </div>

          {/* ---------------- right ---------------- */}
          <div className="flex flex-col gap-5">
            <section className={cardClass}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Assigned Projects</h2>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {activeProjects.length} Active
                  </span>
                </div>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View All
                  <ArrowRight size={12} />
                </Link>
              </div>

              {loading && <p className="mt-4 text-sm text-slate-500">Loading projects...</p>}
              {loadError && <p className="mt-4 text-sm text-red-600">{loadError}</p>}
              {!loading && !loadError && !myProjects.length && (
                <p className="mt-4 text-sm text-slate-500">No projects assigned yet.</p>
              )}

              {featured && (
                <div className="mt-4 rounded-xl bg-[#f3f1ee] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-semibold uppercase text-indigo-600">
                        {featured.id}
                      </p>
                      <p className="text-sm font-bold text-slate-900">{featured.name}</p>
                      {featured.description && <p className="text-xs text-slate-500">{featured.description}</p>}
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        PROJECT_STATUS[featured.status]?.className ?? 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {PROJECT_STATUS[featured.status]?.label ?? featured.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Milestone Progress</span>
                      <span className="font-bold text-slate-900">{projectProgress(featured, tasks)}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#1b2559] to-indigo-500"
                        style={{ width: `${projectProgress(featured, tasks)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <UserRound size={12} className="text-slate-400" />
                      <b>Role:</b> {featured.ownerId === userId ? 'Team Leader' : 'Team Member'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" />
                      {featured.members?.length ?? 0} Team Members Assigned
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={12} className="text-slate-400" />
                      <b>Deadline:</b> {formatDate(featured.deadline)}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Link
                      to={`/projects/${featured.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f1d4a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1b2a66]"
                    >
                      Workspace
                      <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              )}

              {otherProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="mt-3 block rounded-xl border border-slate-200 p-3.5 text-xs hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{project.name}</p>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${
                        PROJECT_STATUS[project.status]?.className ?? 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {PROJECT_STATUS[project.status]?.label ?? project.status}
                    </span>
                  </div>
                  {project.description && <p className="mt-1 text-slate-500">{project.description}</p>}
                </Link>
              ))}
            </section>

            <section className={cardClass}>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Performance Overview</h2>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat
                  label="Tasks Completed"
                  value={`${stats.done} / ${stats.total}`}
                  note="Across all projects"
                  valueClass="text-indigo-600"
                />
                <Stat label="Completion Rate" value={`${stats.rate}%`} note="Done vs assigned" />
                <Stat label="In Progress" value={stats.active} note="Active + in review" />
                <Stat
                  label="Overdue"
                  value={stats.overdue}
                  note={stats.overdue ? 'Needs attention' : 'All on time'}
                  valueClass={stats.overdue ? 'text-red-600' : 'text-slate-900'}
                  noteClass={stats.overdue ? 'text-red-500' : 'text-emerald-600'}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Weekly Completed Tasks</span>
                <span className="font-semibold text-indigo-600">Last 8 Weeks</span>
              </div>
              <Sparkline values={stats.weekly} />
            </section>
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}