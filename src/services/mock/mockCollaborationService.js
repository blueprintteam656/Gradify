import meetingsData from '../../mocks/data/meetings.json';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getTeamChat(projectId) {
  await delay();
  return [];
}

export async function sendMessage(projectId, message) {
  await delay();
  return { id: `msg${Date.now()}`, ...message, createdAt: new Date().toISOString() };
}

export async function getMeetings() {
  await delay();
  return [...meetingsData];
}

export async function getMeetingById(id) {
  await delay();
  const meeting = meetingsData.find((m) => m.id === id);
  if (!meeting) throw new Error('Meeting not found');
  return { ...meeting };
}

export async function getMeetingNotes(meetingId) {
  await delay();
  return [];
}

export async function getFilePreview(fileId) {
  await delay();
  return { fileId, url: '#', name: 'file.pdf' };
}

export async function getFileVersions(fileId) {
  await delay();
  return [];
}

export async function search(query) {
  await delay();
  return { results: [] };
}
