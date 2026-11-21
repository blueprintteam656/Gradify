import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, Bell, CalendarClock, CalendarDays, CheckCircle2, ChevronLeft,
  ChevronRight, Clock3, Flag, Hourglass, Plus, RefreshCw, Search, ShieldCheck, Sparkles,
  UserCheck, Zap, AlertCircle, ExternalLink, Video,
} from "lucide-react";
import { getDeadlinesOverview } from "../../../services/mock/mockDeadlinesService";

const TABS = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "soon", label: "Due Soon" },
  { key: "milestones", label: "Milestones" },
  { key: "sprints", label: "Sprints" },
];

const PRIORITY_STYLE = {
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Standard: "bg-slate-100 text-slate-600",
};

const AVATAR_COLORS = ["bg-indigo-100 text-indigo-700", "bg-sky-100 text-sky-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-violet-100 text-violet-700"];

const day0 = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysUntil = (value) => Math.round((day0(value) - day0(new Date())) / 86400000);
const sameDay = (a, b) => day0(a).getTime() === day0(b).getTime();
const fmtDate = (v, opts = { month: "short", day: "numeric", year: "numeric" }) => new Date(v).toLocaleDateString("en-US", opts);
const fmtTime = (v) => new Date(v).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const initials = (name) => name.replace(/\(.*?\)/g, "").trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

function dueLabel(due) {
  const n = daysUntil(due);
  if (n < 0) return `Overdue by ${Math.abs(n)} day${n === -1 ? "" : "s"}`;
  if (n === 0) return "Due today";
  return `Due in ${n} day${n === 1 ? "" : "s"}`;
}

function Avatars({ names }) {
  if (names.length === 1 && names[0] === "All Team Members") return <span className="text-xs font-semibold text-slate-600">All Team Members</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex -space-x-1.5">
        {names.slice(0, 3).map((n, i) => (
          <span key={n} title={n} className={`flex size-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold ${AVATAR_COLORS[(i + n.length) % AVATAR_COLORS.length]}`}>
            {initials(n)}
          </span>
        ))}
      </span>
      <span className="truncate text-xs font-medium text-slate-600">{names.join(", ")}</span>
    </span>
  );
}

function Badge({ className = "", children }) {
  return <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${className}`}>{children}</span>;
}

function StatCard({ icon: Icon, tone, label, value, hint, pill }) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-lg font-extrabold leading-tight text-[#102452]">{value}</p>
      </div>
      {pill && <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">{hint}</span>}
    </article>
  );
}

function DeadlineRow({ item, tone, onRemind, navigate }) {
  const border = { critical: "border-l-rose-500 bg-rose-50/40", week: "border-l-amber-400", upcoming: "border-l-indigo-400", milestone: "border-l-indigo-600 bg-indigo-50/40" }[tone];
  return (
    <article className={`rounded-xl border border-slate-100 border-l-4 bg-white p-4 shadow-sm ${border}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.major && <Badge className="bg-indigo-700 text-white">Major Milestone (30% Midterm)</Badge>}
            <Badge className={tone === "critical" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}>{dueLabel(item.due)}</Badge>
            <Badge className={PRIORITY_STYLE[item.priority]}>{item.priority === "Standard" ? "Standard" : `${item.priority} Priority`}</Badge>
            {item.status && <Badge className="bg-indigo-50 text-indigo-700">{item.status}</Badge>}
            {item.tag && <Badge className="bg-violet-100 text-violet-700"><Sparkles size={10} />{item.tag}</Badge>}
            {item.sprint && tone === "critical" && <Badge className="bg-slate-100 text-slate-600">{item.sprint} • {item.sprintLabel}</Badge>}
          </div>
          <h3 className="mt-2 text-sm font-bold text-[#102452]">{item.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{item.project} › {item.layer}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className={`inline-flex items-center gap-1 font-semibold ${tone === "critical" ? "text-rose-600" : "text-slate-500"}`}>
              <CalendarClock size={13} />
              {tone === "critical" ? "Deadline: " : ""}{fmtDate(item.due)}{tone !== "critical" && tone !== "milestone" ? ` (${fmtTime(item.due)})` : ""}
              {item.venue ? ` (${item.venue})` : ""}
            </span>
            <span className="min-w-0 text-slate-400">Assignees:</span>
            <Avatars names={item.assignees} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {item.major ? (
            <button type="button" onClick={() => navigate("/documentation")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#102452] px-4 py-2 text-xs font-bold text-white hover:bg-[#0d1d44]">
              Deliverable Hub <ExternalLink size={13} />
            </button>
          ) : (
            <button type="button" onClick={() => navigate(`/tasks/${item.id}`)} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold ${tone === "critical" ? "bg-[#102452] text-white hover:bg-[#0d1d44]" : "bg-[#f3f1ee] text-[#102452] hover:bg-slate-200"}`}>
              View Task <ArrowRight size={13} />
            </button>
          )}
          {tone === "critical" && (
            <button type="button" onClick={() => onRemind(item)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#f3f1ee] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">
              <Bell size={12} /> Remind {item.assignees[0].split(" ")[0]}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function MiniCalendar({ deadlines, selectedDay, onSelect }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const marks = useMemo(() => {
    const map = new Map();
    deadlines.forEach((d) => {
      const date = new Date(d.due);
      if (date.getFullYear() !== year || date.getMonth() !== month) return;
      const n = daysUntil(d.due);
      const kinds = map.get(date.getDate()) ?? new Set();
      if (n < 0) kinds.add("overdue");
      else if (d.kind === "milestone") kinds.add("milestone");
      else if (d.advisor) kinds.add("advisor");
      else if (n <= 3) kinds.add("soon");
      map.set(date.getDate(), kinds);
    });
    return map;
  }, [deadlines, year, month]);

  const markClass = (kinds) =>
    kinds?.has("overdue") ? "bg-rose-100 text-rose-700 font-bold"
      : kinds?.has("milestone") ? "bg-indigo-100 text-indigo-700 font-bold"
      : kinds?.has("advisor") ? "bg-sky-100 text-sky-700 font-bold"
      : kinds?.has("soon") ? "bg-amber-100 text-amber-700 font-bold" : "text-slate-600";

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#102452]"><CalendarDays size={15} className="text-indigo-500" />{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-md p-1 hover:bg-slate-100"><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-md p-1 hover:bg-slate-100"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((n, i) => {
          if (!n) return <span key={`e${i}`} />;
          const date = new Date(year, month, n);
          const today = sameDay(date, new Date());
          const selected = selectedDay && sameDay(date, selectedDay);
          const marked = marks.has(n);
          return (
            <button key={n} type="button" disabled={!marked} onClick={() => onSelect(selected ? null : date)}
              className={`aspect-square rounded-md transition ${markClass(marks.get(n))} ${today ? "ring-2 ring-[#102452]" : ""} ${selected ? "outline outline-2 outline-offset-1 outline-indigo-500" : ""} ${marked ? "hover:brightness-95" : "cursor-default"}`}>
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
        {[["bg-rose-500", "Overdue"], ["bg-amber-400", "Soon"], ["bg-indigo-500", "Milestone"], ["bg-sky-500", "Advisor"]].map(([c, l]) => (
          <span key={l} className="inline-flex items-center gap-1"><span className={`size-2 rounded-full ${c}`} />{l}</span>
        ))}
      </div>
    </section>
  );
}

export default function UpcomingDeadlines() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [priority, setPriority] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getDeadlinesOverview());
    } catch (err) {
      setError(err?.message || "Failed to load deadlines.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const deadlines = useMemo(() => data?.deadlines ?? [], [data]);

  const stats = useMemo(() => ({
    total: deadlines.length,
    overdue: deadlines.filter((d) => daysUntil(d.due) < 0).length,
    week: deadlines.filter((d) => { const n = daysUntil(d.due); return n >= 0 && n <= 7; }).length,
    advisor: deadlines.filter((d) => d.advisor).length,
  }), [deadlines]);

  const counts = useMemo(() => ({
    all: deadlines.length,
    overdue: stats.overdue,
    soon: deadlines.filter((d) => { const n = daysUntil(d.due); return n >= 0 && n <= 3; }).length,
    milestones: deadlines.filter((d) => d.kind === "milestone").length,
    sprints: deadlines.filter((d) => d.sprint).length,
  }), [deadlines, stats.overdue]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return deadlines
      .filter((d) => {
        const n = daysUntil(d.due);
        const byTab = tab === "all" || (tab === "overdue" && n < 0) || (tab === "soon" && n >= 0 && n <= 3) ||
          (tab === "milestones" && d.kind === "milestone") || (tab === "sprints" && d.sprint);
        const byPriority = priority === "All" || d.priority === priority;
        const byDay = !selectedDay || sameDay(d.due, selectedDay);
        const byText = !needle || [d.title, d.layer, d.project, ...d.assignees].join(" ").toLowerCase().includes(needle);
        return byTab && byPriority && byDay && byText;
      })
      .sort((a, b) => new Date(a.due) - new Date(b.due));
  }, [deadlines, tab, priority, query, selectedDay]);

  const critical = visible.filter((d) => daysUntil(d.due) < 0);
  const week = visible.filter((d) => { const n = daysUntil(d.due); return n >= 0 && n <= 7; });
  const upcoming = visible.filter((d) => daysUntil(d.due) > 7);
  const weekRange = week.length ? `Scheduled ${fmtDate(week[0].due, { month: "short", day: "numeric" })} - ${fmtDate(week[week.length - 1].due, { month: "short", day: "numeric" })}` : "";
  const upcomingRange = upcoming.length ? `${fmtDate(upcoming[0].due, { month: "short", day: "numeric" })} - ${fmtDate(upcoming[upcoming.length - 1].due, { month: "short", day: "numeric" })}` : "";

  const remind = (item) => setToast(`Reminder sent to ${item.assignees[0]}.`);
  const sprint = data?.sprint;
  const velocity = sprint ? Math.round((sprint.completed / sprint.total) * 100) : 0;
  const nextMilestone = deadlines.find((d) => d.kind === "milestone" && daysUntil(d.due) >= 0);

  return (
    <div className="min-h-full bg-[#f8f7f4] px-4 py-5 sm:px-7">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Deadlines synced in real time • Academic sprint active
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#102452]">Upcoming Deadlines</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">Track, prioritize, and meet semester milestone deliverables across your active project sprint.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/tasks/calendar" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#102452] no-underline hover:bg-slate-50"><CalendarDays size={14} /> Open Full Calendar</Link>
            <Link to="/tasks/create" className="inline-flex items-center gap-2 rounded-lg bg-[#102452] px-4 py-2.5 text-xs font-bold text-white no-underline hover:bg-[#0d1d44]"><Plus size={14} /> New Deliverable</Link>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Flag} tone="bg-indigo-50 text-indigo-600" label="Total Tracked" value={`${stats.total} Deadlines`} hint="All sprints" pill />
          <StatCard icon={AlertTriangle} tone="bg-rose-50 text-rose-600" label="Overdue Alert" value={<span className="text-rose-600">{stats.overdue} Urgent</span>} hint="Action Needed" pill />
          <StatCard icon={Hourglass} tone="bg-sky-50 text-sky-600" label="Due This Week" value={`${stats.week} Tasks`} hint="Next 7d" pill />
          <StatCard icon={UserCheck} tone="bg-violet-50 text-violet-600" label="Advisor Sign-off" value={`${stats.advisor} Pending`} hint={data?.advisor ? `Dr. ${data.advisor.name.split(" ").pop()}` : "Advisor"} pill />
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} /><span className="flex-1">{error}</span>
            <button type="button" onClick={load} className="font-bold underline">Retry</button>
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          {/* Main column */}
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {TABS.map((t) => (
                  <button key={t.key} type="button" onClick={() => setTab(t.key)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${tab === t.key ? "bg-[#0d2051] text-white" : "bg-[#f3f1ee] text-slate-600 hover:bg-slate-200"}`}>
                    {t.label} ({counts[t.key]})
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <label className="flex items-center gap-1.5 rounded-lg bg-[#f3f1ee] px-2.5 py-1.5">
                  <Search size={13} />
                  <input aria-label="Search deadlines" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-24 bg-transparent outline-none placeholder:text-slate-400" />
                </label>
                <label className="flex items-center gap-1.5">Priority:
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg bg-[#f3f1ee] px-2 py-1.5 font-semibold text-slate-700">
                    <option value="All">All Priorities</option><option>High</option><option>Medium</option><option>Standard</option>
                  </select>
                </label>
                <span className="inline-flex items-center gap-1.5"><span className={`size-2 rounded-full ${loading ? "bg-amber-400" : "bg-emerald-500"}`} />Status: {loading ? "Loading" : "Ready"}</span>
                <button type="button" aria-label="Refresh" onClick={load} className="rounded-md p-1.5 hover:bg-slate-100"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /></button>
              </div>
            </div>

            {selectedDay && (
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs text-indigo-800">
                <span>Showing deadlines for <b>{fmtDate(selectedDay)}</b></span>
                <button type="button" onClick={() => setSelectedDay(null)} className="font-bold underline">Clear</button>
              </div>
            )}

            {loading && !data ? (
              <div className="space-y-3" aria-label="Loading deadlines">{[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />)}</div>
            ) : !visible.length ? (
              <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
                <CheckCircle2 size={32} className="mx-auto text-slate-300" />
                <h2 className="mt-3 font-bold text-[#102452]">No deadlines found</h2>
                <p className="mt-1 text-sm text-slate-500">Try changing the filters, search, or selected date.</p>
              </div>
            ) : (
              <>
                {critical.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102452]"><AlertTriangle size={15} className="text-rose-500" />Critical & Overdue Deliverables <Badge className="bg-rose-100 text-rose-700">{critical.length} Required</Badge></h2>
                      <span className="text-[11px] font-semibold text-rose-500">Auto-escalation sent to supervisor</span>
                    </div>
                    {critical.map((d) => <DeadlineRow key={d.id} item={d} tone="critical" onRemind={remind} navigate={navigate} />)}
                  </section>
                )}
                {week.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102452]"><Zap size={15} className="text-amber-500" />Due This Week <Badge className="bg-slate-100 text-slate-600">{week.length} Active</Badge></h2>
                      <span className="text-[11px] text-slate-400">{weekRange}</span>
                    </div>
                    {week.map((d) => <DeadlineRow key={d.id} item={d} tone="week" onRemind={remind} navigate={navigate} />)}
                  </section>
                )}
                {upcoming.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102452]"><Flag size={15} className="text-indigo-500" />Upcoming Milestones & Next Sprints</h2>
                      <span className="text-[11px] text-slate-400">{upcomingRange}</span>
                    </div>
                    {upcoming.map((d) => <DeadlineRow key={d.id} item={d} tone={d.major ? "milestone" : "upcoming"} onRemind={remind} navigate={navigate} />)}
                  </section>
                )}
              </>
            )}
          </div>

          {/* Side column */}
          <aside className="min-w-0 space-y-4">
            <MiniCalendar deadlines={deadlines} selectedDay={selectedDay} onSelect={setSelectedDay} />

            {data?.meeting && (
              <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#102452]"><Video size={15} className="text-indigo-500" />Supervisor Sync Scheduled</h2>
                <div className="mt-3 rounded-lg bg-indigo-50/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-[#102452]">{data.meeting.title}</p>
                    <Badge className="bg-emerald-100 text-emerald-700">{data.meeting.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{data.advisor.name} • {data.advisor.faculty}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Clock3 size={12} />{fmtDate(data.meeting.date, { month: "short", day: "numeric", year: "numeric" })} • {fmtTime(data.meeting.date)} ({data.meeting.minutes} min)</p>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">Please attach your latest SRS document (Chapter 3) and architecture diagrams at least 24 hours prior to the review meeting.</p>
                <Link to="/documentation/export-pdf" className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#f3f1ee] px-3 py-2.5 text-xs font-bold text-[#102452] no-underline hover:bg-slate-200"><ShieldCheck size={13} />Prepare Meeting Submission Dossier</Link>
              </section>
            )}

            {!aiDismissed && (
              <section className="rounded-xl bg-[#1B2858] p-4 text-white shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-sm font-bold"><Sparkles size={15} />Gradify AI Pro Assistant</h2>
                  <Badge className="bg-white/15 text-white">Deliverable Assist</Badge>
                </div>
                <p className="mt-3 text-xs italic leading-5 text-indigo-100">
                  {nextMilestone ? `"Your ${nextMilestone.title.split(" ").slice(0, 2).join(" ")} milestone is due in ${daysUntil(nextMilestone.due)} days. ` : '"'}Ask Gradify AI to check for missing database transaction rollbacks before submission to {data?.advisor?.name ?? "your advisor"}."
                </p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => navigate("/ai-workspace/chat", { state: { prompt: "Check my Milestone 3 sequence diagram for missing database transaction rollbacks." } })}
                    className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#102452] hover:bg-indigo-50">Draft with AI</button>
                  <button type="button" onClick={() => setAiDismissed(true)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20">Dismiss</button>
                </div>
              </section>
            )}

            {sprint && (
              <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#102452]">
                  <span>{sprint.name} Velocity</span><span className="text-indigo-600">{velocity}% Done</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${velocity}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>Completed: {sprint.completed} of {sprint.total} tasks</span>
                  <span>Target: {fmtDate(sprint.target, { month: "short", day: "numeric" })}</span>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl bg-[#102452] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
