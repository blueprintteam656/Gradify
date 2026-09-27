import projectsData from '../../mocks/data/projects.json';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getProjects() {
  await delay();
  return [...projectsData];
}

export async function getProjectById(id) {
  await delay();
  const project = projectsData.find((p) => p.id === id);
  if (!project) throw new Error('Project not found');
  return { ...project };
}

export async function createProject(payload) {
  await delay();
  return { id: `p${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
}

export async function updateProject(id, payload) {
  await delay();
  return { id, ...payload };
}

export async function deleteProject(id) {
  await delay();
  return { message: 'Project deleted' };
}

export async function getProjectMembers(projectId) {
  await delay();
  const project = projectsData.find((p) => p.id === projectId);
  return project?.members ?? [];
}

export async function inviteMember(projectId, userId) {
  await delay();
  return { message: 'Member invited' };
}
