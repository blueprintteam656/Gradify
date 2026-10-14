import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Flag,
  GraduationCap,
  Landmark,
  Link2,
  Lock,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';
import ProfileShell from '../components/ProfileShell';

/* ------------------------------------------------------------------ */
/* DEMO DATA: used only for fields that currentUser does not have yet. */
/* Delete this block once the backend sends the real data.             */
/* ------------------------------------------------------------------ */
const DEMO = {
  email: 'nouran.mohamed@eelu.edu.eg',
  faculty: 'Faculty of Computers & Information, EELU',
  university: 'Egyptian E-Learning University (EELU)',
  department: 'Computer Science',
  phoneNumber: '+20 102 345 6789',
  studentId: '20221234',
  graduationYear: 2027,
  username: 'nouran_lead27',
  teamRole: 'Team Leader',
  supervisedBy: 'Supervised under Academic Committee • Project Group GP-2027-04',
  enrollmentStatus: 'Enrolled • Active',
  skills: [
    'React.js',
    'TypeScript',
    'ASP.NET Core 8.0',
    'Tailwind CSS',
    'UI/UX Architecture',
    'SQL Server & EF Core',
    'Git & GitHub CI/CD',
    'RESTful APIs',
    'Agile Scrum Methodology',
    'AI Prompt Engineering',
  ],
  skillCompetency: {
    level: 'High (Level 4)',
    note: 'Skills were cross-verified via Sprint #1 and #2 code review audits submitted to Dr. Aris Thorne.',
  },
  projects: [
    {
      id: 1,
      code: 'GP-2027-CORE',
      name: 'Gradify Core Platform',
      description: 'AI-Powered Graduation Project...',
      status: 'In Progress',
      progress: 68,
      sprint: 'Sprint 3: Deliverable Architecture & DB Schema',
      role: 'Team Leader • Frontend Lead',
      members: 4,
      totalMembers: 6,
      supervisorName: 'Dr. Aris Thorne',
    },
    {
      id: 2,
      name: 'Mobile Learning System (Course Project)',
      description: 'Archived project repository • Grade awarded: A (95%)',
      status: 'Completed',
      year: 2026,
    },
  ],
  academicStanding: {
    rank: 'Top 5%',
    gpa: '3.88',
    gpaNote: 'Excellent with Honors',
    tasksDone: 22,
    tasksTotal: 28,
    velocity: '94%',
    velocityNote: '+8% vs team avg',
    advisorRating: '4.9',
    advisorName: 'Dr. Aris Thorne',
    weeklyActivity: [4, 5, 4, 6, 5, 7, 6, 8],
  },
};

const DOT_COLORS = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-slate-700', 'bg-amber-500'];
const USE_DEMO_DATA = false; // خليها true لو عايز تشوف الشكل زي التصميم

const withDemo = (user) =>
  USE_DEMO_DATA
    ? Object.assign(
        {},
        DEMO,
        Object.fromEntries(Object.entries(user ?? {}).filter(([, v]) => v != null && v !== ''))
      )
    : user ?? {};

function splitName(user) {
  if (user?.firstName) return [user.firstName, user.lastName ?? ''];
  const [first = '', ...rest] = (user?.name ?? user?.fullName ?? '').trim().split(/\s+/);
  return first ? [first, rest.join(' ')] : ['Nouran', 'Mohamed'];
}

/* ------------------------------------------------------------------ */
/* small components                                                    */
/* ------------------------------------------------------------------ */

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

function Stat({ label, value, note, noteClass = 'text-slate-500', valueClass = 'text-slate-900' }) {
  return (
    <div className="rounded-xl bg-[#f3f1ee] p-3.5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueClass}`}>{value ?? '—'}</p>
      {note && <p className={`mt-0.5 text-[11px] ${noteClass}`}>{note}</p>}
    </div>
  );
}

function Sparkline({ values }) {
  if (!values?.length) {
    return <p className="mt-2 text-xs text-slate-400">No activity recorded yet.</p>;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? 100 / (values.length - 1) : 100;
  const coords = values.map((v, i) => `${i * step},${26 - ((v - min) / range) * 20}`);

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

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function UserProfile() {
  const { currentUser } = useAuth();
  const user = withDemo(currentUser);

  const [firstName, lastName] = splitName(currentUser);
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  const picture = user.profilePictureUrl ?? user.profilePicture ?? '';
  const skills = (user.skills ?? []).map((s) => (typeof s === 'string' ? s : s.name));
  const projects = user.projects ?? [];
  const isCompleted = (p) => String(p.status ?? '').toLowerCase() === 'completed';
  const activeProjects = projects.filter((p) => !isCompleted(p));
  const completedProjects = projects.filter(isCompleted);
  const featured = activeProjects[0];
  const standing = user.academicStanding ?? {};

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
              <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                ID: {user.studentId}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage your personal information, verified competencies, and active graduation milestones.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
            <p className="text-slate-500">System Status</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-slate-900">
              <span className="size-2 rounded-full bg-emerald-500" />
              {user.enrollmentStatus}
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
                {picture ? (
                  <img src={picture} alt={fullName} className="size-full object-cover" />
                ) : initials ? (
                  initials
                ) : (
                  <UserRound size={40} />
                )}
              </div>
              <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                <CheckCircle2 size={12} />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#2a1458] px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Users size={11} />
                  {user.teamRole}
                </span>
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  Senior Class {user.graduationYear}
                </span>
              </div>

              <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Landmark size={14} className="text-slate-400" />
                  {user.faculty}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  {user.supervisedBy}
                </span>
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
                <ReadOnlyField label="University email" value={user.email} icon={<Lock size={12} />} />
                <ReadOnlyField
                  label="Portal username"
                  value={`@${user.username}`}
                  icon={<Lock size={12} />}
                  mono
                />
                <ReadOnlyField
                  label="Phone contact"
                  value={user.phoneNumber}
                  icon={<Smartphone size={13} />}
                  iconClass="text-emerald-500"
                />
                <ReadOnlyField
                  label="Academic student ID"
                  value={user.studentId}
                  icon={<CheckCircle2 size={13} />}
                  mono
                />
                <ReadOnlyField
                  label="Graduation class"
                  value={`Class of ${user.graduationYear}`}
                  icon={<GraduationCap size={14} />}
                  iconClass="text-indigo-500"
                />
                <div className="sm:col-span-2">
                  <ReadOnlyField
                    label="University affiliation"
                    value={user.university}
                    icon={<Building2 size={13} />}
                  />
                </div>
                <ReadOnlyField label="Department" value={user.department} icon={<Building2 size={13} />} />
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={18} className="mt-0.5 text-[#1b2559]" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Technical Skills &amp; Competencies</h2>
                    <p className="max-w-xs text-xs text-slate-500">
                      Skills verified by supervisors and tracked across team deliverables.
                    </p>
                  </div>
                </div>
                {/* TODO: connect to a "propose skill" flow */}
                <button
                  type="button"
                  disabled
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-[#f3f1ee] px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-70"
                >
                  <span className="flex size-4 items-center justify-center rounded-full border border-slate-500">
                    <Plus size={10} />
                  </span>
                  Propose New Skill
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {skills.length ? (
                  skills.map((skill, index) => {
                    const isAI = /^ai\b/i.test(skill);
                    return (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                          isAI
                            ? 'border-violet-200 bg-violet-50 text-violet-800'
                            : 'border-slate-200 bg-[#f3f1ee] text-slate-700'
                        }`}
                      >
                        {isAI ? (
                          <Sparkles size={11} className="text-violet-600" />
                        ) : (
                          <span className={`size-1.5 rounded-full ${DOT_COLORS[index % DOT_COLORS.length]}`} />
                        )}
                        {skill}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No skills added yet.</p>
                )}
              </div>

              {user.skillCompetency && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#f3f1ee] p-3.5">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#1b2559]" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900">
                      Skill Competency Index: {user.skillCompetency.level}
                    </p>
                    <p className="mt-0.5 text-slate-600">{user.skillCompetency.note}</p>
                  </div>
                </div>
              )}
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

              {featured ? (
                <div className="mt-4 rounded-xl bg-[#f3f1ee] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {featured.code && (
                        <p className="font-mono text-[10px] font-semibold text-indigo-600">{featured.code}</p>
                      )}
                      <p className="text-sm font-bold text-slate-900">{featured.name ?? featured.title}</p>
                      {featured.description && (
                        <p className="text-xs text-slate-500">{featured.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {featured.status ?? 'In Progress'}
                    </span>
                  </div>

                  {typeof featured.progress === 'number' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Milestone Progress</span>
                        <span className="font-bold text-slate-900">{featured.progress}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[#1b2559] to-indigo-500"
                          style={{ width: `${Math.min(featured.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-col gap-1 text-xs text-slate-600">
                    {featured.sprint && (
                      <span className="flex items-center gap-1.5">
                        <Flag size={12} className="text-indigo-500" />
                        <b>{featured.sprint.split(':')[0]}:</b>
                        {featured.sprint.split(':').slice(1).join(':')}
                      </span>
                    )}
                    {featured.role && (
                      <span className="flex items-center gap-1.5">
                        <UserRound size={12} className="text-slate-400" />
                        <b>Role:</b> {featured.role}
                      </span>
                    )}
                    {featured.totalMembers && (
                      <span className="flex items-center gap-1.5">
                        <Users size={12} className="text-slate-400" />
                        {featured.members ?? 0} / {featured.totalMembers} Team Members Assigned
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="size-2 rounded-full bg-amber-400" />
                      {featured.supervisorName}
                    </span>
                    <Link
                      to={featured.id ? `/projects/${featured.id}` : '/projects'}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f1d4a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1b2a66]"
                    >
                      Workspace
                      <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No projects assigned yet.</p>
              )}

              {completedProjects.map((project) => (
                <div
                  key={project.id ?? project.name}
                  className="mt-3 rounded-xl border border-slate-200 p-3.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{project.name ?? project.title}</p>
                    <span className="shrink-0 rounded bg-[#f3f1ee] px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      Completed {project.year ?? ''}
                    </span>
                  </div>
                  {project.description && <p className="mt-1 text-slate-500">{project.description}</p>}
                </div>
              ))}
            </section>

            <section className={cardClass}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900">Academic Standing</h2>
                </div>
                {standing.rank && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <TrendingUp size={12} />
                    {standing.rank}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat
                  label="Cumulative GPA"
                  value={standing.gpa}
                  note={standing.gpaNote}
                  noteClass="text-emerald-600"
                />
                <Stat
                  label="Tasks Completed"
                  value={standing.tasksTotal ? `${standing.tasksDone ?? 0} / ${standing.tasksTotal}` : undefined}
                  note={standing.tasksTotal ? 'Across all sprints' : undefined}
                  valueClass="text-indigo-600"
                />
                <Stat
                  label="Sprint Velocity"
                  value={standing.velocity}
                  note={standing.velocityNote}
                  noteClass="text-emerald-600"
                />
                <Stat
                  label="Advisor Rating"
                  value={standing.advisorRating ? `${standing.advisorRating} / 5` : undefined}
                  note={standing.advisorName ? `Review by ${standing.advisorName}` : undefined}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Weekly Deliverable Activity</span>
                <span className="font-semibold text-indigo-600">Last 8 Weeks</span>
              </div>
              <Sparkline values={standing.weeklyActivity} />
            </section>
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}