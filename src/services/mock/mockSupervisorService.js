const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getSupervisorDashboard() {
  await delay();
  return { totalProjects: 3, activeStudents: 4, pendingReviews: 2 };
}

export async function getAnalytics() {
  await delay();
  return { projectCompletion: [], taskDistribution: [], activityTrend: [] };
}

export async function getActivityLog() {
  await delay();
  return [];
}
