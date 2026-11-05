
import { getSupervisorDashboard as getMockSupervisorDashboard } from "../mock/mockSupervisorService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

async function apiRequest(path, token, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const response = await fetch(
    `${API_BASE_URL.replace(/\/$/, "")}${path}`,
    {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json();
}

export async function getSupervisorDashboard({
  supervisorId,
  token,
  signal,
} = {}) {
  if (USE_MOCK) {
    return getMockSupervisorDashboard(supervisorId);
  }

  // Proposed endpoint; confirm with backend team.
  return apiRequest("/supervisor/dashboard", token, { signal });
}

export async function reviewTask({
  taskId,
  decision,
  comment = "",
  token,
  signal,
}) {
  if (USE_MOCK) {
    throw new Error("Review actions require a connected backend.");
  }

  // Proposed endpoint and payload.
  return apiRequest(`/supervisor/reviews/${encodeURIComponent(taskId)}`, token, {
    method: "PATCH",
    body: JSON.stringify({ decision, comment }),
    signal,
  });
}
