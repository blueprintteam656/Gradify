import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowRight, Bell, CalendarDays, CheckCircle2, CloudUpload, FolderPlus, HelpCircle,
  Lock, Search, ShieldCheck, Sparkles, SquareCheckBig, X, Zap, FileCheck2, Users, ClipboardList, Loader2,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { ROLES } from "../../../constants/roles";

const ROLE_INFO = {
  [ROLES.TEAM_LEADER]: { label: "Team Leader", text: "Full project authoring, resource allocation, and milestone dispatch permissions enabled." },
  [ROLES.TEAM_MEMBER]: { label: "Team Member", text: "Task execution, deliverable submission, and collaboration permissions enabled." },
  [ROLES.SUPERVISOR]: { label: "Advisor", text: "Milestone review, feedback, and grading permissions enabled." },
};

const WORKFLOWS = [
  { id: "project", title: "Create Project", desc: "Initialize a new graduation project workspace, set semester goals, and configure central Git repositories.", icon: FolderPlus, key: "P", tag: "Team Leader Only", tagStyle: "bg-indigo-50 text-indigo-700", roles: [ROLES.TEAM_LEADER], cta: "Configure", status: "Active Term Slot Ready", statusStyle: "text-emerald-600", to: "/projects/create" },
  { id: "task", title: "Create Task", desc: "Draft a new deliverable, assign student teammates, set priority matrix, and bind to milestone deadlines.", icon: SquareCheckBig, key: "T", tag: "Active Sprint", tagStyle: "bg-emerald-50 text-emerald-700", roles: [ROLES.TEAM_LEADER, ROLES.TEAM_MEMBER], cta: "Quick Create", status: "Sprint Backlog #04", statusStyle: "text-slate-500", modal: "task", featured: true },
  { id: "upload", title: "Upload Deliverable", desc: "Submit SRS documents, architecture schemas, or zipped code repositories for supervisor evaluation.", icon: CloudUpload, key: "U", tag: "Phase 3 Submissions", tagStyle: "bg-indigo-50 text-indigo-700", roles: [ROLES.TEAM_LEADER, ROLES.TEAM_MEMBER], cta: "Upload File", status: "Due in 4 days", statusStyle: "text-amber-600", modal: "upload" },
  { id: "sync", title: "Schedule Sync", desc: "Book an advisor milestone review, internal team standup, or sprint retrospective video conference.", icon: CalendarDays, key: "M", tag: null, roles: [ROLES.TEAM_LEADER, ROLES.TEAM_MEMBER, ROLES.SUPERVISOR], cta: "Book Slot", status: "Slots open: Tue & Thu", statusStyle: "text-slate-500", to: "/collaboration/meetings" },
];
const AI_KEY = "J";
const AI_PROMPTS = ["Summarize Chapter 3 Methodology", "Audit sprint dependencies", "Rewrite my abstract"];

const minutesAgo = (n) => new Date(Date.now() - n * 60000).toISOString();
const SEED_LOG = [
  { id: "s1", action: "Created Sprint Task", icon: SquareCheckBig, by: "Alex Morgan", target: "REQ-204_DB_Schema", at: minutesAgo(12), status: "Committed" },
  { id: "s2", action: "AI SRS Risk Audit", icon: Sparkles, by: "Omar R.", target: "IEEE_Chapter_2.pdf", at: minutesAgo(48), status: "Indexed" },
  { id: "s3", action: "Deliverable Staged", icon: CloudUpload, by: "Mena A.", target: "Sprint_3_Prototype.zip", at: minutesAgo(130), status: "Awaiting Advisor" },
];
const STATUS_STYLE = { Committed: "bg-emerald-50 text-emerald-700", Indexed: "bg-indigo-50 text-indigo-700", "Awaiting Advisor": "bg-amber-50 text-amber-700", Submitted: "bg-sky-50 text-sky-700", Approved: "bg-emerald-50 text-emerald-700" };

function ago(iso) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  return `${h} hour${h === 1 ? "" : "s"} ago`;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || "");
const MOD = isMac ? "⌥" : "Alt";
const Kbd = ({ k }) => <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{MOD} + {k}</span>;

export default function QuickActions() {
  const navigate = useNavigate();
  const { currentUser, switchRole } = useAuth();
  const role = currentUser?.role ?? ROLES.TEAM_MEMBER;
  const info = ROLE_INFO[role] ?? ROLE_INFO[ROLES.TEAM_MEMBER];
  const name = currentUser?.name || "Student";

  const [view, setView] = useState("standard"); // standard | loading | empty | error
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState(SEED_LOG);
  const [limitLocked] = useState(true);
  const searchRef = useRef(null);

  const notify = useCallback((type, message) => setToast({ type, message }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const addLog = useCallback((entry) => setLog((prev) => [{ id: `l${Date.now()}`, by: name, at: new Date().toISOString(), ...entry }, ...prev]), [name]);

  const allowed = useCallback((wf) => wf.roles.includes(role), [role]);

  const run = useCallback((wf) => {
    if (!allowed(wf)) return notify("error", `${info.label} role is not authorized to ${wf.title.toLowerCase()}.`);
    if (wf.to) return navigate(wf.to);
    if (wf.modal) setModal(wf.modal);
  }, [allowed, info.label, navigate, notify]);

  const openAI = (prompt) => navigate("/ai-workspace/chat", prompt ? { state: { prompt } } : undefined);

  // Keyboard shortcuts: Alt/Option + key (Ctrl/Cmd combos are reserved by the browser).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") return setModal(null);
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const code = e.code.replace("Key", "");
      if (code === "K") { e.preventDefault(); return searchRef.current?.focus(); }
      if (code === AI_KEY) { e.preventDefault(); return openAI(); }
      const wf = WORKFLOWS.find((w) => w.key === code);
      if (wf) { e.preventDefault(); run(wf); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const workflows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKFLOWS.filter((w) => !q || `${w.title} ${w.desc}`.toLowerCase().includes(q));
  }, [query]);

  const loading = view === "loading";
  const rows = view === "empty" ? [] : log;

  return (
    <div className="min-h-full bg-[#f8f7f4] px-4 py-5 sm:px-7">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Top strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
          <p className="text-xs text-slate-500">Workspace › Team Portal › <b className="text-[#102452]">Dashboard</b></p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg bg-[#f3f1ee] px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input ref={searchRef} aria-label="Search quick actions" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, tasks, team members..." className="w-44 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:w-60" />
              <Kbd k="K" />
            </label>
            <button type="button" onClick={() => run(WORKFLOWS[1])} className="inline-flex items-center gap-1.5 rounded-lg bg-[#102452] px-4 py-2 text-xs font-bold text-white hover:bg-[#0d1d44]"><Zap size={13} />Quick Create</button>
            <button type="button" aria-label="Notifications" onClick={() => navigate("/dashboard/notifications")} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Bell size={17} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500" /></button>
            <button type="button" aria-label="Help" onClick={() => notify("info", `Shortcuts: ${MOD} + P / T / U / M / J, ${MOD} + K to search.`)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><HelpCircle size={17} /></button>
          </div>
        </div>

        {/* Hero */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
                <span className="text-indigo-600">Workspace Operations Hub</span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">v2.4 Production Sandbox</span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102452]">Quick Actions & Operations</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Instant role-authorized shortcuts for rapid project workflows, task delegation, and AI assistance across the capstone lifecycle.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#f8f7f4] p-3 text-xs">
              <label className="flex items-center gap-2 font-semibold text-slate-500"><Users size={13} />Role:
                <select value={role} onChange={(e) => switchRole(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 font-bold text-[#102452]">
                  {Object.entries(ROLE_INFO).map(([value, r]) => <option key={value} value={value}>{r.label}{value === role ? " (Active)" : ""}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 font-semibold text-slate-500">State:
                <select value={view} onChange={(e) => setView(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 font-bold text-[#102452]">
                  <option value="standard">Standard View</option><option value="loading">Loading</option><option value="empty">Empty</option><option value="error">Error</option>
                </select>
              </label>
              <button type="button" onClick={() => notify("success", "Action completed successfully.")} className="rounded-md border border-emerald-200 px-2.5 py-1.5 font-bold text-emerald-600 hover:bg-emerald-50"><CheckCircle2 size={12} className="mr-1 inline" />Toast</button>
              <button type="button" onClick={() => notify("error", "Something went wrong. Please try again.")} className="rounded-md border border-rose-200 px-2.5 py-1.5 font-bold text-rose-600 hover:bg-rose-50"><AlertCircle size={12} className="mr-1 inline" />Error</button>
            </div>
          </div>
        </section>

        {/* Persona banner */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0d2051] px-5 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="shrink-0 text-indigo-300" />
            <p className="text-sm"><b>Active Persona: {name} ({info.label})</b><span className="block text-xs text-indigo-200">{info.text}</span></p>
          </div>
          <div className="flex gap-2 text-[11px] font-bold">
            <span className="rounded-md bg-white/10 px-2.5 py-1.5">• Direct API Connection</span>
            <span className="rounded-md bg-indigo-600 px-2.5 py-1.5">Term 2026-27 Phase 3</span>
          </div>
        </section>

        {view === "error" && (
          <div role="alert" className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} /><span className="flex-1">Could not load quick actions. Check your connection and try again.</span>
            <button type="button" onClick={() => setView("standard")} className="font-bold underline">Retry</button>
          </div>
        )}

        {/* Primary workflows */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102452]">Primary Workflows <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">5 Available</span></h2>
            <span className="text-[11px] text-slate-400">Press shortcut keys anytime to invoke</span>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white" />)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {workflows.map((wf) => {
                const ok = allowed(wf);
                const Icon = wf.icon;
                return (
                  <article key={wf.id} className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${wf.featured && ok ? "border-t-4 border-t-indigo-600 border-slate-100" : "border-slate-100"} ${ok ? "" : "opacity-60"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{ok ? <Icon size={19} /> : <Lock size={18} />}</span>
                      <div className="flex flex-col items-end gap-1.5">
                        {wf.tag && <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${wf.tagStyle}`}>{wf.tag}</span>}
                        <Kbd k={wf.key} />
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-extrabold text-[#102452]">{wf.title}</h3>
                    <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{wf.desc}</p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-semibold ${ok ? wf.statusStyle : "text-slate-400"}`}>{ok ? `● ${wf.status}` : "Not available for your role"}</span>
                      <button type="button" onClick={() => run(wf)} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold ${wf.featured && ok ? "bg-[#102452] text-white hover:bg-[#0d1d44]" : "bg-[#f3f1ee] text-[#102452] hover:bg-slate-200"}`}>
                        {ok ? wf.cta : "Attempt"} {wf.id === "task" && ok ? <Zap size={12} /> : <ArrowRight size={12} />}
                      </button>
                    </div>
                  </article>
                );
              })}

              {/* AI Assistant (wide card) */}
              <article className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-sm md:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1B2858] text-white"><Sparkles size={20} /></span>
                    <div>
                      <h3 className="flex flex-wrap items-center gap-2 text-base font-extrabold text-[#102452]">Gradify AI Assistant <span className="rounded bg-[#1B2858] px-2 py-0.5 text-[10px] font-bold text-white">● Gemini AI Engine Active</span></h3>
                      <p className="mt-1 max-w-md text-xs leading-5 text-slate-600">Synthesize IEEE project requirements, scan for structural SRS ambiguities, formulate work-breakdown structures, or polish thesis prose.</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Kbd k={AI_KEY} />
                    <button type="button" onClick={() => openAI()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B2858] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#141e44]"><Sparkles size={13} />Launch Copilot</button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-semibold text-slate-500">Quick Prompts:</span>
                  {AI_PROMPTS.map((p) => (
                    <button key={p} type="button" onClick={() => openAI(p)} className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 font-semibold text-slate-600 hover:border-indigo-300">“{p}”</button>
                  ))}
                </div>
              </article>
            </div>
          )}
        </section>

        {/* Permission showcase */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102452]">Permission & Restriction Showcase <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">Role Restrictions</span></h2>
            <span className="text-[11px] text-slate-400">Live enforcement according to academic guidelines</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Lock size={18} /></span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Locked: Limit Reached</span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-500">Create Secondary Project</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">Active limit exceeded: Students can only participate in 1 primary graduation capstone repository per academic term.</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">● Term Policy §4.1B</span>
                <button type="button" disabled={limitLocked} className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-400"><Lock size={12} />Action Locked</button>
              </div>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><FileCheck2 size={18} /></span>
                <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">Advisor Clearance Required</span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-500">Approve Milestone & Issue Final Grade</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">Sign off on mid-term thesis submissions and post final rubrics directly to the University Registrar portal.</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">● Faculty Single-Sign-On</span>
                <button type="button" onClick={() => {
                  if (role !== ROLES.SUPERVISOR) return notify("error", "Advisor clearance required to approve milestones.");
                  addLog({ action: "Approved Milestone", icon: ShieldCheck, target: "Sprint 3 Midterm", status: "Approved" });
                  notify("success", "Milestone approved and sent to the registrar.");
                }} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"><Lock size={12} />Attempt Request</button>
              </div>
            </article>
          </div>
        </section>

        {/* Dispatch log */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102452]"><ClipboardList size={15} className="text-indigo-500" />Recent Operation Dispatch Log</h2>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="size-1.5 rounded-full bg-emerald-500" />Live Telemetry</span>
          </div>
          {loading ? (
            <div className="space-y-2 p-5">{[1, 2, 3].map((i) => <div key={i} className="h-9 animate-pulse rounded bg-slate-100" />)}</div>
          ) : !rows.length ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500"><ClipboardList size={28} className="mx-auto mb-2 text-slate-300" />No operations dispatched yet. Run a quick action to see it here.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                  <tr>{["Action", "Executed by", "Target entity", "Timestamp", "Status"].map((h) => <th key={h} className="px-5 py-2.5 font-bold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const Icon = r.icon ?? CheckCircle2;
                    return (
                      <tr key={r.id}>
                        <td className="px-5 py-3 font-bold text-[#102452]"><Icon size={13} className="mr-2 inline text-indigo-500" />{r.action}</td>
                        <td className="px-5 py-3 text-slate-600">{r.by}</td>
                        <td className="px-5 py-3 font-mono text-slate-500">{r.target}</td>
                        <td className="px-5 py-3 text-slate-400">{ago(r.at)}</td>
                        <td className="px-5 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${STATUS_STYLE[r.status] ?? "bg-slate-100 text-slate-600"}`}>{r.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modal && <QuickModal type={modal} onClose={() => setModal(null)} onDone={(entry, msg) => { addLog(entry); notify("success", msg); setModal(null); }} />}

      {toast && (
        <div role="status" className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.type === "error" ? "bg-rose-600" : toast.type === "success" ? "bg-emerald-600" : "bg-[#102452]"}`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}{toast.message}
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="ml-1 opacity-80 hover:opacity-100"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function QuickModal({ type, onClose, onDone }) {
  const isTask = type === "task";
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [due, setDue] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const valid = isTask ? title.trim().length >= 3 : !!file;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500)); // mock network call
    if (isTask) onDone({ action: "Created Sprint Task", icon: SquareCheckBig, target: title.trim().slice(0, 28), status: "Committed" }, "Task created and added to the sprint backlog.");
    else onDone({ action: "Deliverable Staged", icon: CloudUpload, target: file.name, status: "Awaiting Advisor" }, "Deliverable staged for advisor review.");
  };

  const field = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-label={isTask ? "Quick create task" : "Upload deliverable"} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#102452]">{isTask ? "Quick Create Task" : "Upload Deliverable"}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-3 text-xs font-semibold text-slate-600">
          {isTask ? (
            <>
              <label className="block">Task title<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Draft SRS Chapter 4" className={field} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">Priority
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={field}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select>
                </label>
                <label className="block">Due date<input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} /></label>
              </div>
            </>
          ) : (
            <label className="block">File (PDF, DOCX, ZIP — max 25 MB)
              <input type="file" accept=".pdf,.doc,.docx,.zip,.rar" onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f && f.size <= 25 * 1024 * 1024 ? f : null);
              }} className={field} />
            </label>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="submit" disabled={!valid || busy} className="inline-flex items-center gap-2 rounded-lg bg-[#102452] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy && <Loader2 size={14} className="animate-spin" />}{isTask ? "Create Task" : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
}
