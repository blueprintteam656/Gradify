import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, Bell, CalendarDays, CheckCircle2,
  Clock3, FileText, FolderKanban, Info, RefreshCw, Search,
  ShieldCheck, Users, X, AlertCircle,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import ProfileShell from "../../profile/components/ProfileShell";
import { getActivities } from "../../../services/api/activitiesService";

const TYPES = [
  { label: "All Activities", value: "ALL" },
  { label: "Tasks & Milestones", value: "TASK" },
  { label: "Deliverables & Files", value: "FILE" },
  { label: "Meetings & Feedback", value: "MEETING" },
  { label: "Projects & Team", value: "PROJECT" },
];
const iconFor = {
  TASK: CheckCircle2, MILESTONE: ShieldCheck, FILE: FileText,
  DELIVERABLE: FileText, MEETING: CalendarDays, FEEDBACK: Bell,
  PROJECT: FolderKanban, TEAM: Users, OTHER: Activity,
};
const typeColors = {
  TASK: "bg-amber-100 text-amber-600",
  MILESTONE: "bg-emerald-100 text-emerald-600",
  FILE: "bg-blue-100 text-blue-600",
  DELIVERABLE: "bg-blue-100 text-blue-600",
  MEETING: "bg-indigo-100 text-indigo-600",
  FEEDBACK: "bg-indigo-100 text-indigo-600",
  PROJECT: "bg-violet-100 text-violet-600",
  TEAM: "bg-emerald-100 text-emerald-600",
  OTHER: "bg-slate-100 text-slate-600",
};
const timeValue = (value) => {
  const n = new Date(value).getTime();
  return Number.isFinite(n) ? n : 0;
};
function dateLabel(value) {
  if (!timeValue(value)) return "Unknown date";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
function dayGroup(value) {
  if (!timeValue(value)) return "Unknown date";
  const day = new Date(value).toDateString();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (day === today.toDateString()) return "Today";
  if (day === yesterday.toDateString()) return "Yesterday";
  return new Date(value).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}
function initials(name) {
  return (name || "?").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}

export default function RecentActivity() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [category, setCategory] = useState("ALL");
  const [period, setPeriod] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async ({ initial = false } = {}) => {
    if (!currentUser?.id) return;
    if (!initial) setRefreshing(true);
    try {
      const result = await getActivities({ user: currentUser });
      setActivities(result);
      setUpdatedAt(new Date());
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load activities.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    setLoading(true);
    setActivities([]);
    setUpdatedAt(null);
    load({ initial: true });
    // Polling fallback; true instant updates require backend SSE/WebSocket.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const visible = useMemo(() => {
    const cutoff = period === "all" ? 0 : Date.now() - Number(period) * 86400000;
    const needle = query.trim().toLowerCase();
    return activities
      .filter((item) => {
        const matchesCategory = category === "ALL" ||
          (category === "TASK" && ["TASK", "MILESTONE"].includes(item.type)) ||
          (category === "FILE" && ["FILE", "DELIVERABLE"].includes(item.type)) ||
          (category === "MEETING" && ["MEETING", "FEEDBACK"].includes(item.type)) ||
          (category === "PROJECT" && ["PROJECT", "TEAM"].includes(item.type));
        const text = [
          item.title, item.description, item.projectName,
          item.actor?.name, item.action,
        ].filter(Boolean).join(" ").toLowerCase();
        return matchesCategory && timeValue(item.createdAt) >= cutoff &&
          (!needle || text.includes(needle));
      })
      .sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt));
  }, [activities, category, period, query]);

  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((item) => {
      const key = dayGroup(item.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return [...map.entries()];
  }, [visible]);

  return (
    <ProfileShell pageTitle="Recent Activity">
      <div className="min-h-full bg-[#f8f7f4] px-4 py-5 sm:px-7">
        <div className="mx-auto max-w-7xl space-y-5">
          <section className="rounded-2xl border border-slate-100 bg-white px-6 py-6 shadow-sm">
            <div className="text-xs text-slate-500">
              Workspace › Dashboard › <b className="text-[#102452]">Recent Activity</b>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-[#102452]">
                    Recent Activity
                  </h1>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#102452]">
                    {activities.length} updates
                  </span>
                  <span className="rounded-md bg-violet-100 px-2 py-1 text-[11px] font-semibold text-violet-800">
                    Audit Log
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Chronological project updates, task activity, deliverables, meetings, and feedback.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" disabled={refreshing || loading}
                  onClick={() => load()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f3f1ee] px-4 py-2.5 text-xs font-bold text-[#102452] disabled:opacity-50">
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
                <select aria-label="Activity date range" value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="rounded-lg border-0 bg-[#f3f1ee] px-4 py-2.5 text-xs font-semibold text-slate-700">
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((type) => (
                  <button type="button" key={type.value} onClick={() => setCategory(type.value)}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold transition ${
                      category === type.value ? "bg-[#0d2051] text-white" :
                      "bg-[#f3f1ee] text-slate-600 hover:bg-slate-200"
                    }`}>
                    {type.label}
                    {type.value === "ALL" ? ` (${activities.length})` : ""}
                  </button>
                ))}
              </div>
              <label className="flex min-w-0 items-center gap-2 rounded-lg bg-[#f3f1ee] px-3 py-2">
                <Search size={15} className="text-slate-500" />
                <input aria-label="Search activities" value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search activities..." className="w-44 bg-transparent text-xs outline-none placeholder:text-slate-400" />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-5 py-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className={`size-2 rounded-full ${error ? "bg-rose-500" : "bg-emerald-500"}`} />
              <b>{error ? "Sync issue" : "Auto-refresh every 30 seconds"}</b>
              <span className="text-slate-400">
                {updatedAt ? `· Last checked ${updatedAt.toLocaleTimeString()}` : "· Waiting for first sync"}
              </span>
            </div>
            <span className="text-slate-400">Read-only activity history</span>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle size={18} />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => load()} className="font-bold underline">Retry</button>
            </div>
          )}

          {loading && !activities.length ? (
            <div className="space-y-3" aria-label="Loading activities">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : !visible.length ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center">
              <Activity size={32} className="mx-auto text-slate-300" />
              <h2 className="mt-3 font-bold text-[#102452]">No activities found</h2>
              <p className="mt-1 text-sm text-slate-500">
                {activities.length ? "Try changing the filters or search." :
                  "There are no recorded activities in your accessible projects."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map(([day, items]) => (
                <section key={day}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-[#0d2051] px-3 py-1 text-xs font-bold text-white">{day}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-500">{items.length} events recorded</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const Icon = iconFor[item.type] || Activity;
                      return (
                        <article key={item.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                          <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${typeColors[item.type] || typeColors.OTHER}`}>
                            <Icon size={19} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold text-[#102452]">
                                {item.actor?.name || "System / Unspecified actor"}
                              </span>
                              {item.actor?.role && <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">{item.actor.role}</span>}
                              <span className="text-slate-400">• {dateLabel(item.createdAt)}</span>
                              <span className="rounded bg-[#f3f1ee] px-2 py-1 text-slate-600">{item.projectName}</span>
                            </div>
                            <h3 className="mt-2 text-sm font-bold text-[#102452]">{item.title}</h3>
                            {item.description && <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>}
                            {item.metadata?.assigneeName && (
                              <p className="mt-2 text-xs text-slate-400">Assigned to: {item.metadata.assigneeName}</p>
                            )}
                          </div>
                          <button type="button" onClick={() => setSelected(item)}
                            className="self-start whitespace-nowrap rounded-lg bg-[#f3f1ee] px-3 py-2 text-xs font-bold text-[#102452] hover:bg-slate-200">
                            View Details
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-label="Activity details"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#102452]">Activity Details</h2>
              <button type="button" aria-label="Close details" onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><b className="text-slate-800">Activity:</b> {selected.title}</p>
              <p><b className="text-slate-800">Project:</b> {selected.projectName}</p>
              <p><b className="text-slate-800">Performed by:</b> {selected.actor?.name || "Not recorded"}</p>
              <p><b className="text-slate-800">Time:</b> {dateLabel(selected.createdAt)}</p>
              <p><b className="text-slate-800">Type:</b> {selected.type}</p>
              {selected.description && <p className="rounded-lg bg-slate-50 p-3">{selected.description}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setSelected(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold">Close</button>
              {selected.detailsPath?.startsWith("/") && !selected.detailsPath.startsWith("//") && (
                <Link to={selected.detailsPath}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#102452] px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setSelected(null)}>
                  Open Related Item <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </section>
        </div>
      )}
    </ProfileShell>
  );
}
