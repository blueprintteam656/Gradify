import tasksData from '../../mocks/data/tasks.json';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getTasks() {
  await delay();
  return [...tasksData];
}

export async function getTaskById(id) {
  await delay();
  const task = tasksData.find((t) => t.id === id);
  if (!task) throw new Error('Task not found');
  return { ...task };
}

export async function getTasksByProject(projectId) {
  await delay();
  return tasksData.filter((t) => t.projectId === projectId);
}

export async function createTask(payload) {
  await delay();
  return { id: `t${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
}

export async function updateTask(id, payload) {
  await delay();
  return { id, ...payload };
}

export async function deleteTask(id) {
  await delay();
  return { message: 'Task deleted' };
}

export async function getSubtasks(taskId) {
  await delay();
  return [];
}
