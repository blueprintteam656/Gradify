/** Frontend-only demonstration data. Not a backend, and never shared between users. */
const STORAGE_KEY = 'gradify-notifications-ui-demo-v1';
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();
const daysAgo = (days, hour = 15, minute = 15) => {
  const d = new Date(); d.setDate(d.getDate() - days); d.setHours(hour, minute, 0, 0); return d.toISOString();
};
const seeds = [
  { id: 'demo-01', type: 'FEEDBACK', title: 'Supervisor Feedback on Milestone 2', message: 'Supervisor Name approved Milestone 2 deliverables and left a note: Good work on finalizing the ER diagram. Please refine the AI Task suggestion dependencies before next Monday’s review session.', createdAt: minutesAgo(10), isRead: false, link: '/projects', actionLabel: 'View Milestone 2', tag: 'Supervisor Note', extraTag: '@Mention' },
  { id: 'demo-02', type: 'AI', title: 'AI Generated Sub-Tasks for Sprint 4', message: 'Gemini AI Engine has decomposed your project SRS document into 5 actionable tasks with estimated effort and suggested assignees for review.', createdAt: minutesAgo(42), isRead: false, link: '/ai-workspace/tasks', actionLabel: 'Review AI Tasks', tag: 'Gemini AI', extraTag: '5 New Tasks' },
  { id: 'demo-03', type: 'TASK', title: 'Task Assigned: Integrate JWT Auth & Tokens', message: 'Team member Omar R. re-assigned backend authentication integration to you under the #SecurityLayer module.', createdAt: minutesAgo(120), isRead: false, link: '/tasks/kanban', actionLabel: 'Open Kanban Card', tag: 'High Priority', extraTag: 'Due Tomorrow' },
  { id: 'demo-04', type: 'SYSTEM', title: 'GitHub Repository Sync Successful', message: 'Pull request #14 (refactor: database context) was merged into main. 6 new commits verified by auto-build.', createdAt: minutesAgo(240), isRead: false, link: '/dashboard/recent-activity', actionLabel: 'View Details', tag: 'GitHub Bot' },
  { id: 'demo-05', type: 'MEETING', title: 'Advisor Meeting Scheduled', message: 'Sprint 3 Review Meeting is set for Monday at 11:00 AM in Lab 4B with Supervisor Name.', createdAt: daysAgo(1), isRead: true, link: '/collaboration/meetings', actionLabel: 'View Meeting', tag: 'Calendar' },
  { id: 'demo-06', type: 'SYSTEM', title: 'SRS Chapter 1 & 2 Signed Off', message: 'Your documentation for Chapters 1 and 2 has been approved by the supervisor.', createdAt: daysAgo(1, 11, 20), isRead: true, link: '/projects', actionLabel: 'View Project', tag: 'Approved 100%' },
  { id: 'demo-07', type: 'MENTION', title: 'You Were Mentioned in a Team Discussion', message: 'Mariam tagged you in the discussion about sprint deliverables and requested your feedback.', createdAt: daysAgo(2, 17, 5), isRead: true, link: '/projects', actionLabel: 'View Details', tag: '@Mention' },
  { id: 'demo-08', type: 'TASK', title: 'Kanban Card Moved to In Review', message: 'The API integration card has moved from In Progress to In Review.', createdAt: daysAgo(2, 10, 30), isRead: true, link: '/tasks/kanban', actionLabel: 'Open Kanban Card', tag: 'Task Update' },
  { id: 'demo-09', type: 'SYSTEM', title: 'File Upload Complete', message: 'The updated architecture diagram was uploaded successfully to your project workspace.', createdAt: daysAgo(3, 16, 45), isRead: true, link: '/projects', actionLabel: 'View Files', tag: 'System' },
  { id: 'demo-10', type: 'MENTION', title: 'Supervisor Mentioned You in Feedback', message: 'Your supervisor asked you to review the new acceptance criteria for the module.', createdAt: daysAgo(4, 13, 20), isRead: true, link: '/projects', actionLabel: 'View Feedback', tag: '@Mention' },
  { id: 'demo-11', type: 'MEETING', title: 'Meeting Minutes Are Available', message: 'Meeting notes for the weekly team sync are ready to review.', createdAt: daysAgo(5, 12, 0), isRead: true, link: '/collaboration/meetings', actionLabel: 'Open Meeting', tag: 'Calendar' },
  { id: 'demo-12', type: 'SYSTEM', title: 'Workspace Activity Summary', message: 'Your team completed 7 tasks this week and updated 3 project deliverables.', createdAt: daysAgo(6, 9, 10), isRead: true, link: '/dashboard/recent-activity', actionLabel: 'View Activity', tag: 'Weekly Summary' },
];

function read() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const items = JSON.parse(saved);
      if (Array.isArray(items)) return items;
    }
  } catch { /* Local storage unavailable; demo still displays initial items. */ }
  return seeds.map(x => ({ ...x }));
}
function write(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Demo fallback remains in-memory. */ }
  return items;
}
let memoryItems;
const current = () => memoryItems || (memoryItems = read());
export async function getDemoNotifications() { return current().map(x => ({ ...x })); }
export async function markDemoNotificationRead(id) {
  memoryItems = write(current().map(x => String(x.id) === String(id) ? { ...x, isRead: true } : x));
  return null;
}
export async function markAllDemoNotificationsRead() {
  memoryItems = write(current().map(x => ({ ...x, isRead: true })));
  return null;
}
export async function deleteDemoNotification(id) {
  memoryItems = write(current().filter(x => String(x.id) !== String(id)));
  return null;
}
export function resetDemoNotifications() {
  memoryItems = seeds.map(x => ({ ...x }));
  write(memoryItems);
  return memoryItems.map(x => ({ ...x }));
}
