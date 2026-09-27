const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getDocumentation(projectId) {
  await delay();
  return [];
}

export async function generateReadme(projectId) {
  await delay(500);
  return { content: '# Project README\n\nGenerated readme content.' };
}

export async function generateSRS(projectId) {
  await delay(500);
  return { content: '# SRS Document\n\nGenerated SRS content.' };
}

export async function generateReport(projectId, type) {
  await delay(500);
  return { content: `# ${type} Report\n\nGenerated report content.` };
}

export async function exportPDF(documentId) {
  await delay(500);
  return { url: '#', filename: 'document.pdf' };
}

export async function getVersionHistory(documentId) {
  await delay();
  return [];
}

export async function getDiagramSuggestions(projectId) {
  await delay();
  return [];
}
