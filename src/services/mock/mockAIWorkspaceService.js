const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function uploadSRS(file) {
  await delay(500);
  return { id: `srs${Date.now()}`, filename: file?.name ?? 'document.pdf', status: 'uploaded' };
}

export async function analyzeDocument(documentId) {
  await delay(800);
  return { documentId, modules: [], tasks: [], roadmap: null };
}

export async function getGeneratedModules(documentId) {
  await delay();
  return [];
}

export async function getGeneratedTasks(documentId) {
  await delay();
  return [];
}

export async function getAIRoadmap(projectId) {
  await delay();
  return { projectId, milestones: [] };
}

export async function chatWithAI(message) {
  await delay(500);
  return { reply: `AI response to: "${message}"` };
}

export async function getMeetingSummary(meetingId) {
  await delay();
  return { meetingId, summary: 'Meeting summary placeholder', actionItems: [] };
}

export async function getRecommendations(projectId) {
  await delay();
  return [];
}
