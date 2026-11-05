
import projects from "../../mocks/data/projects.json";
import tasks from "../../mocks/data/tasks.json";
import users from "../../mocks/data/users.json";

const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getSupervisorDashboard(supervisorId) {
  await delay();

  // Temporary mock fallback.
  // The backend must return only projects assigned to this supervisor.
  const supervisedProjects = projects.filter(
    (project) =>
      project.supervisorId === supervisorId
  );

  const projectIds = new Set(
    supervisedProjects.map((project) => project.id)
  );

  const supervisedTasks = tasks.filter((task) =>
    projectIds.has(task.projectId)
  );

  const studentIds = new Set(
    supervisedProjects.flatMap(
      (project) => project.members ?? []
    )
  );

  const students = users.filter(
    (user) =>
      studentIds.has(user.id) &&
      ["TeamLeader", "TeamMember"].includes(user.role)
  );

  const pendingReviews = supervisedTasks.filter(
    (task) => task.status === "IN_REVIEW"
  );

  return {
    totalProjects: supervisedProjects.length,
    activeStudents: students.length,
    pendingReviews: pendingReviews.length,
    completedProjects: supervisedProjects.filter(
      (project) => project.status === "COMPLETED"
    ).length,
    projects: supervisedProjects,
    tasks: supervisedTasks,
    reviews: pendingReviews,
  };
}

export async function getAnalytics() {
  await delay();

  return {
    projectCompletion: [],
    taskDistribution: [],
    activityTrend: [],
  };
}

export async function getActivityLog() {
  await delay();
  return [];
}
