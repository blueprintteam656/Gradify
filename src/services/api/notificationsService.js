import { getDemoNotifications, markDemoNotificationRead, markAllDemoNotificationsRead, deleteDemoNotification } from '../mock/demoNotificationsService';

// Demo is enabled by default for the UI-only handoff. Set VITE_NOTIFICATIONS_DEMO=false
// to use the existing authenticated API once the backend team is ready.
export const NOTIFICATIONS_DEMO = import.meta.env.VITE_NOTIFICATIONS_DEMO !== 'false';

// This module intentionally never falls back to sample notifications: real mode
// requires a signed JWT and a running backend.
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
function token() {
  try {
    const raw = sessionStorage.getItem('gradify-session') || localStorage.getItem('gradify-session');
    return raw && JSON.parse(raw).accessToken;
  } catch { return null; }
}
async function request(path, method = 'GET', signal) {
  if (!BASE) throw new Error('Configure VITE_API_BASE_URL to connect to the notifications backend.');
  const accessToken = token();
  if (!accessToken || accessToken.startsWith('mock-')) throw new Error('Real notifications require backend login and a valid JWT. Mock login cannot access this API.');
  const res = await fetch(`${BASE}/notifications${path}`, {
    method, signal,
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Session expired. Please log in again.');
    if (res.status === 403) throw new Error('Not authorized to access this notification.');
    if (res.status === 404) throw new Error('Notification not found.');
    throw new Error(`Notifications request failed (${res.status}).`);
  }
  return res.status === 204 ? null : res.json();
}
export const getNotifications = (signal) => NOTIFICATIONS_DEMO ? getDemoNotifications() : request('', 'GET', signal);
export const markNotificationRead = (id) => NOTIFICATIONS_DEMO ? markDemoNotificationRead(id) : request(`/${encodeURIComponent(id)}/read`, 'PUT');
export const markAllNotificationsRead = () => NOTIFICATIONS_DEMO ? markAllDemoNotificationsRead() : request('/read-all', 'PUT');
export const deleteNotification = (id) => NOTIFICATIONS_DEMO ? deleteDemoNotification(id) : request(`/${encodeURIComponent(id)}`, 'DELETE');
