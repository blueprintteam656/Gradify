import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, BarChart3, CalendarDays, CheckCircle2,
  ClipboardCheck, Clock3, FolderKanban, RefreshCw, Users,
} from 'lucide-react';
import ProfileShell from '../../profile/components/ProfileShell';
import { getSupervisorDashboard } from '../../../services/api/supervisorService';

const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm';
const statusStyles = {
  ON_TRACK: 'bg-emerald-50 text-emerald-700',
  BEHIND_SCHEDULE: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
};
const statusNames = {
  ON_TRACK: 'On Track',
  BEHIND_SCHEDULE: 'Behind Schedule',
  COMPLETED: 'Completed',
};

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not set'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Metric({ label, value, detail, icon: Icon, color }) {
  return (
    <article className={`${card} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className={`rounded-xl p-2.5 ${color}`}><Icon size={19} /></span>
      </div>
      <p className="mt-3 text-3xl font-extrabold text-[#0f1d4a]">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

function Panel({ title, icon: Icon, action, children }) {
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#0f1d4a]">
          <Icon size={18} className="text-indigo-500" />{title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function SupervisorDashboard() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [scope, setScope] = useState('assigned');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await getSupervisorDashboard({
          supervisorId: currentUser?.id,
          token: currentUser?.token, // Replace with your auth provider's access token if stored elsewhere.
          signal: controller.signal,
        });
        if (!mounted) return;
        setProjects(result.projects);
        setTasks(result.tasks);
        setScope(result.scope);
      } catch (err) {
        if (mounted && !controller.signal.aborted) {
          setProjects([]);
          setTasks([]);
          setError(err?.message || 'Unable to load supervisor dashboard.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; controller.abort(); };
  }, [reload, currentUser?.id, currentUser?.token]);

  // The service returns projects already scoped to the supervisor (or labeled demo data).
  const assignedProjects = projects;
  const demoScope = scope === 'demo';
  const projectRows = useMemo(() => assignedProjects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const done = projectTasks.filter((task) => task.status === 'DONE').length;
    const progress = project.status === 'COMPLETED'
      ? 100
      : projectTasks.length ? Math.round(done / projectTasks.length * 100) : 0;
    return { ...project, progress, taskCount: projectTasks.length, done };
  }), [assignedProjects, tasks]);

  const scopedProjectIds = useMemo(() => new Set(assignedProjects.map((p) => p.id)), [assignedProjects]);
  const scopedTasks = useMemo(() => tasks.filter((task) => scopedProjectIds.has(task.projectId)), [tasks, scopedProjectIds]);
  const reviews = useMemo(() => scopedTasks.filter((task) => task.status === 'IN_REVIEW'), [scopedTasks]);
  const studentCount = useMemo(() => new Set(assignedProjects.flatMap((p) => p.members || [])).size, [assignedProjects]);
  const deadlines = useMemo(() => assignedProjects
    .filter((project) => project.status !== 'COMPLETED' && project.deadline && new Date(project.deadline).getTime() >= Date.now())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4), [assignedProjects]);

  return (
    <ProfileShell active="Supervisor Dashboard" pageTitle="Supervisor Dashboard">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-7">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Workspace › <b className="text-slate-800">Supervisor Dashboard</b></p>
            <h1 className="mt-2 text-2xl font-bold text-[#0f1d4a]">Supervisor Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Monitor project progress, student activity, and reviews.</p>
          </div>
          <button type="button" onClick={() => setReload((v) => v + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {demoScope && <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-800">
          Demo workspace overview: mock projects have no supervisorId, so these figures represent all sample projects, not verified assignments to this supervisor.
        </div>}

        {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total Projects" value={loading ? '—' : projectRows.length} detail={demoScope ? "All demo projects" : "Assigned projects"} icon={FolderKanban} color="bg-indigo-50 text-indigo-600" />
          <Metric label="Assigned Students" value={loading ? '—' : studentCount} detail="Unique project members" icon={Users} color="bg-blue-50 text-blue-600" />
          <Metric label="Pending Reviews" value={loading ? '—' : reviews.length} detail="Tasks marked IN_REVIEW" icon={ClipboardCheck} color="bg-amber-50 text-amber-600" />
          <Metric label="Completed Projects" value={loading ? '—' : projectRows.filter((p) => p.status === 'COMPLETED').length} detail="Completed projects in scope" icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
        </div>

        <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,1fr)]">
          <div className="min-w-0 space-y-5">
            <Panel title="Project Progress" icon={FolderKanban}
              action={<Link to="/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">View projects <ArrowRight size={13} /></Link>}>
              {loading ? <p className="text-sm text-slate-500">Loading projects...</p> : projectRows.length === 0 ?
                <p className="text-sm text-slate-500">No projects found.</p> :
                <div className="space-y-4">{projectRows.map((project) => (
                  <div key={project.id} className="rounded-xl border border-slate-100 bg-[#f8f9fc] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/projects/${project.id}`} className="text-sm font-bold text-[#0f1d4a] hover:text-indigo-600">{project.name}</Link>
                        <p className="mt-1 text-xs text-slate-500">{project.description || 'No description'}</p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${statusStyles[project.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusNames[project.status] || project.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{project.done} / {project.taskCount} tasks completed</span>
                      <b className="text-[#0f1d4a]">{project.progress}%</b>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1b2559] to-indigo-500" style={{ width: `${project.progress}%` }} />
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><CalendarDays size={13} /> Deadline: {formatDate(project.deadline)}</p>
                  </div>
                ))}</div>}
            </Panel>
            <Panel title="Tasks Awaiting Review" icon={ClipboardCheck}>
              {loading ? <p className="text-sm text-slate-500">Loading reviews...</p> : reviews.length === 0 ?
                <p className="text-sm text-slate-500">No tasks currently in review.</p> :
                <div className="space-y-3">{reviews.map((task) => (
                  <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#0f1d4a]">{task.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{assignedProjects.find((p) => p.id === task.projectId)?.name || 'Project'} · Due {formatDate(task.dueDate)}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">In Review</span>
                  </Link>
                ))}</div>}
              <p className="mt-3 text-[11px] text-slate-400">Review status is read-only here; approval actions require a separate workflow.</p>
            </Panel>
          </div>
          <div className="min-w-0 space-y-5">
            <Panel title="Upcoming Project Deadlines" icon={Clock3}>
              {loading ? <p className="text-sm text-slate-500">Loading deadlines...</p> : deadlines.length === 0 ?
                <p className="text-sm text-slate-500">No upcoming project deadlines found.</p> :
                <div className="space-y-3">{deadlines.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="flex items-center gap-3 rounded-xl bg-[#f8f9fc] p-3 hover:bg-indigo-50">
                    <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><CalendarDays size={16} /></span>
                    <span className="min-w-0"><span className="block truncate text-xs font-bold text-[#0f1d4a]">{project.name}</span><span className="mt-1 block text-[11px] text-slate-500">{formatDate(project.deadline)}</span></span>
                  </Link>
                ))}</div>}
            </Panel>
            <Panel title="Supervisor Workspace" icon={BarChart3}>
              <div className="space-y-2">
                <Link to="/supervisor/analytics" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 hover:bg-indigo-50">Analytics <ArrowRight size={14} /></Link>
                <Link to="/supervisor/activity-log" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 hover:bg-indigo-50">Activity Log <Activity size={14} /></Link>
                <Link to="/projects" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 hover:bg-indigo-50">Browse Projects <ArrowRight size={14} /></Link>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}
