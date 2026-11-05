import { getMockActivities } from "../mock/mockActivitiesService";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function readAccessToken() {
  // Compatibility with the project's existing AuthContext session format.
  // Prefer exposing a token getter from AuthContext when integrating auth.
  try {
    const raw = sessionStorage.getItem("gradify-session") ||
      localStorage.getItem("gradify-session");
    return raw ? JSON.parse(raw)?.accessToken : null;
  } catch {
    return null;
  }
}

function normalizeActivity(activity) {
  const actor = activity.actor ?? activity.user ?? null;
  return {
    id: String(activity.id),
    projectId: activity.projectId ?? activity.project?.id ?? null,
    projectName: activity.projectName ?? activity.project?.name ?? "Project",
    type: String(activity.type ?? "OTHER").toUpperCase(),
    action: activity.action ?? null,
    title: activity.title ?? "Project activity",
    description: activity.description ?? "",
    createdAt: activity.createdAt ?? activity.timestamp ?? null,
    actor: actor ? {
      id: actor.id ?? null,
      name: actor.name ?? actor.fullName ?? "Unknown user",
      avatar: actor.avatar ?? null,
      role: actor.role ?? "",
    } : null,
    metadata: activity.metadata ?? {},
    detailsPath: activity.detailsPath ?? null,
  };
}

export async function getActivities({ user, signal } = {}) {
  if (USE_MOCK) return getMockActivities({ user });

  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is missing.");
  const token = readAccessToken();
  if (!token) throw new Error("No access token. Please sign in again.");

  // Backend MUST authenticate and authorize every returned activity.
  // Do not rely on client-side filtering for access control.
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Session expired. Please sign in again.");
    if (response.status === 403) throw new Error("You don't have access to these activities.");
    throw new Error(`Failed to load activities (${response.status}).`);
  }

  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload?.activities;
  if (!Array.isArray(items)) throw new Error("Unexpected activities API response.");
  return items.map(normalizeActivity).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}
