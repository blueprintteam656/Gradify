import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetDemoNotifications } from '../../../services/mock/demoNotificationsService';
import { Bell, Search, SlidersHorizontal, CheckCheck, Settings, CalendarDays, Sparkles, MessageSquareText, ListTodo, GitPullRequest, Info, Trash2, ArrowRight, RefreshCw, AlertCircle, X, LoaderCircle } from 'lucide-react';
import { NOTIFICATIONS_DEMO, getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../../services/api/notificationsService';

const allowedRoutes = [/^\/dashboard(?:\/|$)/, /^\/projects(?:\/|$)/, /^\/tasks(?:\/|$)/, /^\/collaboration(?:\/|$)/, /^\/ai-workspace(?:\/|$)/, /^\/supervisor(?:\/|$)/, /^\/profile(?:\/|$)/];
const TYPES = {
  MEETING: { icon: CalendarDays, accent: 'text-amber-600 bg-amber-50 border-amber-200', group: 'Mentions' },
  MENTION: { icon: MessageSquareText, accent: 'text-blue-700 bg-blue-50 border-blue-200', group: 'Mentions' },
  FEEDBACK: { icon: MessageSquareText, accent: 'text-blue-700 bg-blue-50 border-blue-200', group: 'Mentions' },
  AI: { icon: Sparkles, accent: 'text-violet-600 bg-violet-50 border-violet-200', group: 'System' },
  TASK: { icon: ListTodo, accent: 'text-blue-700 bg-blue-50 border-blue-200', group: 'System' },
  SYSTEM: { icon: GitPullRequest, accent: 'text-slate-700 bg-slate-50 border-slate-200', group: 'System' },
};
function configFor(type) {
  const key = String(type || '').toUpperCase();
  return TYPES[key] || (key.includes('MEET') ? TYPES.MEETING : key.includes('MENTION') || key.includes('SUPERVIS') ? TYPES.MENTION : key.includes('AI') ? TYPES.AI : key.includes('TASK') ? TYPES.TASK : TYPES.SYSTEM);
}
function dayGroup(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'EARLIER';
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const other = new Date(date); other.setHours(0, 0, 0, 0);
  if (other.getTime() === d.getTime()) return 'TODAY';
  if (other.getTime() === d.getTime() - 86400000) return 'YESTERDAY';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date).toUpperCase();
}
function timestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}
function safePath(path) {
  if (!path || typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return null;
  return allowedRoutes.some((pattern) => pattern.test(path)) ? path : null;
}
export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('All Notifications');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pending, setPending] = useState(false);
  const load = useCallback(async (signal) => {
    try {
      const data = await getNotifications(signal);
      if (signal?.aborted) return;
      if (!Array.isArray(data)) throw new Error('Unexpected notifications response.');
      setItems(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setError('');
    } catch (e) { if (!signal?.aborted) setError(e.message || 'Failed to load notifications.'); }
    finally { if (!signal?.aborted) setBusy(false); }
  }, []);
  useEffect(() => {
    const c = new AbortController();
    load(c.signal);
    // A lightweight refresh keeps the page up to date without pretending SignalR is connected.
    const interval = NOTIFICATIONS_DEMO ? null : setInterval(() => { if (!document.hidden) load(c.signal); }, 30000);
    return () => { c.abort(); clearInterval(interval); };
  }, [load]);
  const unread = items.filter((x) => !x.isRead).length;
  const tabCounts = { 'All Notifications': items.length, Unread: unread, Mentions: items.filter((x) => configFor(x.type).group === 'Mentions').length, System: items.filter((x) => configFor(x.type).group === 'System').length };
  const visible = useMemo(() => items.filter((x) => {
    const type = configFor(x.type).group;
    if (tab === 'Unread' && x.isRead) return false;
    if ((tab === 'Mentions' || tab === 'System') && type !== tab) return false;
    if (filter === 'read' && !x.isRead) return false;
    if (filter === 'unread' && x.isRead) return false;
    return `${x.title || ''} ${x.message || ''} ${x.type || ''}`.toLowerCase().includes(search.toLowerCase().trim());
  }), [items, tab, filter, search]);
  const grouped = useMemo(() => {
    const map = new Map();
    visible.forEach((n) => { const key = dayGroup(n.createdAt); if (!map.has(key)) map.set(key, []); map.get(key).push(n); });
    return [...map.entries()];
  }, [visible]);
  async function markRead(n) {
    if (n.isRead) return true;
    try { setPending(true); await markNotificationRead(n.id); setItems((prev) => prev.map((item) => item.id === n.id ? { ...item, isRead: true } : item)); setError(''); return true; }
    catch (e) { setError(e.message); return false; } finally { setPending(false); }
  }
  async function openNotification(n) {
    if (pending) return;
    const success = await markRead(n);
    if (!success) return;
    const path = safePath(n.link);
    if (path) navigate(path);
  }
  async function markAll() {
    try { setPending(true); await markAllNotificationsRead(); setItems((prev) => prev.map((x) => ({ ...x, isRead: true }))); setError(''); return true; }
    catch (e) { setError(e.message); return false; } finally { setPending(false); }
  }
  async function remove(n) {
    if (!window.confirm('Delete this notification permanently?')) return;
    try { setPending(true); await deleteNotification(n.id); setItems((prev) => prev.filter((x) => x.id !== n.id)); setError(''); return true; }
    catch (e) { setError(e.message); return false; } finally { setPending(false); }
  }
  return (
    <div className="min-h-screen bg-[#F7F7F4] text-[#1B2541] dark:bg-[#101827] dark:text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EAF0] bg-white px-5 py-3 dark:border-slate-700 dark:bg-[#19233a] md:px-7">
        <div><div className="text-[11px] font-medium text-[#7483A2]">Workspace <span className="mx-1">/</span> Communication <span className="mx-1">/</span> Notifications</div><div className="mt-1 flex items-center gap-2"><h1 className="text-xl font-bold tracking-tight">Notifications Center</h1><span className="rounded-full border border-[#D6E0F3] bg-[#EEF3FF] px-2 py-0.5 text-xs font-semibold text-[#32528D]">{unread} Unread</span></div></div>
        <div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 rounded-xl border border-[#E3E8F2] bg-[#F9FBFF] px-3 py-2 text-[#60708F] dark:bg-slate-800"><Search size={15}/><input aria-label="Search notifications" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications, mentions, docs..." className="w-40 bg-transparent text-xs outline-none placeholder:text-[#A0ADC3] sm:w-56"/>{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={14}/></button>}</label>
          <label className="flex items-center gap-1.5 rounded-xl border border-[#E3E8F2] bg-white px-3 py-2 text-xs dark:bg-slate-800"><SlidersHorizontal size={15}/><select aria-label="Filter notifications" className="bg-transparent outline-none" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Filter: All</option><option value="unread">Unread</option><option value="read">Read</option></select></label>
          <button disabled={pending || !unread} onClick={markAll} className="flex items-center gap-2 rounded-xl bg-[#1E305F] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#304c86] disabled:opacity-50"><CheckCheck size={15}/>Mark All as Read</button></div>
      </header>
      <div className="mx-auto max-w-[1200px] px-4 py-5 md:px-7">
        {NOTIFICATIONS_DEMO && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs text-violet-900 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-100"><span><strong>UI Demo Mode:</strong> Sample notifications only. Try filters, reading, and deleting — changes are saved in this browser.</span><button className="rounded-lg border border-violet-300 bg-white px-3 py-1.5 font-semibold text-violet-800 hover:bg-violet-100 dark:bg-violet-900 dark:text-white" onClick={() => { setItems(resetDemoNotifications()); setTab('All Notifications'); setFilter('all'); setSearch(''); setError(''); }}>Reset Demo</button></div>}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E0E7F1] bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#19233a]">
          <div className="flex flex-wrap gap-1">{Object.entries(tabCounts).map(([label, count]) => <button key={label} onClick={() => setTab(label)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${tab === label ? 'bg-[#203362] text-white' : 'text-[#647697] hover:bg-[#EDF2FC] dark:hover:bg-slate-700'}`}>{label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === label ? 'bg-white/20 text-white' : 'bg-[#EDF2FA] text-[#55709A]'}`}>{count}</span></button>)}</div>
          <div className="flex items-center gap-2 px-2 text-[11px] text-[#58709A]"><span className="h-1.5 w-1.5 rounded-full bg-[#385b9e]"/>{NOTIFICATIONS_DEMO ? 'UI Demo • sample notifications' : 'Auto-refresh every 30s'}<span className="mx-1 text-[#D4DCE9]">|</span><button className="flex items-center gap-1 font-semibold" onClick={() => navigate('/profile/settings')}><Settings size={13}/>Notification Settings</button></div>
        </div>
        {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0"/><span className="flex-1">{error}</span><button onClick={() => { setBusy(true); load(); }} className="flex items-center gap-1 font-semibold"><RefreshCw size={14}/>Retry</button></div>}
        {busy ? <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#66789C]"><LoaderCircle className="animate-spin" size={19}/>Loading notifications...</div> : grouped.length === 0 ? <div className="rounded-2xl border border-[#E3E8F0] bg-white px-5 py-16 text-center dark:bg-[#19233a]"><Bell className="mx-auto mb-3 text-[#9CB0D4]" size={33}/><h2 className="font-semibold">No notifications found</h2><p className="mt-1 text-sm text-[#7383A1]">{search || tab !== 'All Notifications' || filter !== 'all' ? 'Try another search or filter.' : 'Your notifications will appear here when an event is created.'}</p></div> : grouped.map(([day, group]) => <section key={day} className="mb-5"><div className="mb-3 flex items-center gap-3"><h2 className="text-[10px] font-bold tracking-wider text-[#64799D]">{day}</h2><div className="h-px flex-1 bg-[#E4E9F1]"/></div><div className="space-y-2.5">{group.map((n) => { const cfg = configFor(n.type); const Icon = cfg.icon; const path = safePath(n.link); return <article key={n.id} className={`group relative overflow-hidden rounded-xl border bg-white p-4 pl-5 shadow-[0_2px_2px_rgba(20,45,90,0.03)] dark:bg-[#19233a] ${!n.isRead ? 'border-[#E0E7F4] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#375A9F]' : 'border-[#EDF0F5] opacity-90'}`}><div className="flex gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cfg.accent}`}><Icon size={19}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[13px] font-bold">{n.title || 'Notification'}</h3><span className="rounded bg-[#EEF3FC] px-1.5 py-0.5 text-[10px] font-semibold text-[#49618D] dark:bg-slate-700 dark:text-slate-200">{n.tag || n.type || 'SYSTEM'}</span>{n.extraTag && <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900 dark:text-violet-100">{n.extraTag}</span>}</div><div className="flex items-center gap-2 text-[11px] text-[#8596B3]"><time dateTime={n.createdAt}>{timestamp(n.createdAt)}</time>{!n.isRead && <span title="Unread" className="h-2 w-2 rounded-full bg-[#2B5294] ring-4 ring-[#EDF3FF]"/>}</div></div><p className="mt-1 text-xs leading-relaxed text-[#64718B] dark:text-slate-300">{n.message}</p><div className="mt-3 flex flex-wrap gap-2">{path && <button disabled={pending} onClick={() => openNotification(n)} className="flex items-center gap-1 rounded-lg bg-[#2D4D8D] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#203766]">{n.actionLabel || 'View Details'} <ArrowRight size={12}/></button>}{!n.isRead && <button disabled={pending} onClick={() => markRead(n)} className="rounded-lg bg-[#F0F3F8] px-3 py-1.5 text-[11px] font-semibold text-[#33415B] hover:bg-[#E2EAF5]">Mark as Read</button>}<button disabled={pending} onClick={() => remove(n)} className="flex items-center gap-1 rounded-lg bg-[#F5F6F8] px-3 py-1.5 text-[11px] font-semibold text-[#66738B] hover:bg-red-50 hover:text-red-700"><Trash2 size={12}/>Delete</button></div></div></div></article>; })}</div></section>)}
        <button onClick={() => { setBusy(true); load(); }} className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#4466A0]"><RefreshCw size={14}/>Refresh notifications</button>
      </div>
    </div>
  );
}

