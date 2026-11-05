import projects from "../../mocks/data/projects.json";
import tasks from "../../mocks/data/tasks.json";
import users from "../../mocks/data/users.json";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getMockActivities({ user } = {}) {
  await wait();
  if (!user?.id) throw new Error("Please sign in to view activities.");

  // This mock is based ONLY on actual task creation records.
  // It does not invent approvals, uploads, meetings or status changes.
  const allowed = projects.filter((project) =>
    user.role === "Supervisor"
      ? project.supervisorId === user.id
      : project.ownerId === user.id || project.members?.includes(user.id)
  );
  const projectMap = new Map(allowed.map((project) => [project.id, project]));
  const userMap = new Map(users.map((person) => [person.id, person]));

  return tasks
    .filter((task) => projectMap.has(task.projectId) && task.createdAt)
    .map((task) => {
      // Task assignee is NOT necessarily the creator; don't misattribute it.
      const assignee = userMap.get(task.assigneeId);
      return {
        id: `task-created-${task.id}`,
        projectId: task.projectId,
        projectName: projectMap.get(task.projectId)?.name ?? "Project",
        type: "TASK",
        action: "TASK_CREATED",
        title: "Task added to project",
        description: `“${task.title}” was created in the project workspace.`,
        createdAt: task.createdAt,
        actor: null,
        metadata: { taskId: task.id, assigneeName: assignee?.name ?? null },
        detailsPath: `/tasks/${encodeURIComponent(task.id)}`,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
