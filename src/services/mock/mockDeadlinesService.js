// Mock data for the Upcoming Deadlines page.
// Dates are generated relative to "today" so the page never looks stale.
// Swap this for a real API call (see services/api/activitiesService.js for the pattern).

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function at(offsetDays, hour = 23, minute = 59) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

const PROJECT = "Gradify Core AI Platform";

export async function getDeadlinesOverview() {
  await wait();

  const deadlines = [
    { id: "t2", offset: -1, title: "Frontend Authentication & Role Guard Routing", layer: "Security & Identity Layer", priority: "High", kind: "task", sprint: "Sprint 2", sprintLabel: "Sprint Backlog", assignees: ["Mohamed A.", "Alex M."], overdue: true },
    { id: "t4", offset: 2, title: "System Architecture & SRS Document Chapter 3", layer: "Software Requirements Specification (SRS)", priority: "High", kind: "task", sprint: "Sprint 3", status: "In Review (Supervisor Approval)", assignees: ["Alex Morgan (Lead)", "Nour L."], advisor: true },
    { id: "t6", offset: 3, title: "Integrate Gemini AI Engine API for Project Summarizer", layer: "AI Intelligence Layer", priority: "High", kind: "task", sprint: "Sprint 3", tag: "AI Feature", assignees: ["Fahd A."] },
    { id: "t7", offset: 5, title: "Peer Code Review: Task Management API", layer: "Backend Architecture", priority: "Medium", kind: "task", sprint: "Sprint 3", assignees: ["Fahd A."] },
    { id: "t8", offset: 6, title: "Design Database Normalization (3NF) & Relational Schema", layer: "Backend Architecture", priority: "Medium", kind: "task", sprint: "Sprint 3", assignees: ["Mena A."] },
    { id: "t9", offset: 8, title: "Implement JWT Authentication & Token Rotation", layer: "Security Layer", priority: "Standard", kind: "task", assignees: ["Omar R."] },
    { id: "t10", offset: 9, title: "Provision Staging Environment & CI/CD Pipeline", layer: "DevOps", priority: "Standard", kind: "task", sprint: "Sprint 3", assignees: ["Dave B."] },
    { id: "m1", offset: 10, title: "Phase 3 Submission Checkpoint", layer: "Department Deliverables", priority: "High", kind: "milestone", assignees: ["All Team Members"] },
    { id: "m2", offset: 12, title: "Sprint 3 Midterm Progress Demo Video & Slide Deck", layer: "Department Deliverables", priority: "High", kind: "milestone", major: true, venue: "Presentation Hall B", assignees: ["All Team Members"] },
    { id: "t11", offset: 14, title: "User Acceptance Testing Plan", layer: "Quality Assurance", priority: "Standard", kind: "task", assignees: ["Mena A."] },
    { id: "t12", offset: 16, title: "Finalize Chapter 2 Literature Review Thesis Book", layer: "Thesis Documentation", priority: "Standard", kind: "task", assignees: ["Nour L."] },
    { id: "t13", offset: 18, title: "Advisor Feedback Revision Round", layer: "Thesis Documentation", priority: "Medium", kind: "task", assignees: ["Alex Morgan (Lead)"] },
    { id: "t14", offset: 21, title: "Sprint 4 Planning & Backlog Grooming", layer: "Project Management", priority: "Standard", kind: "task", assignees: ["Alex Morgan (Lead)"] },
    { id: "m3", offset: 26, title: "Final Thesis Draft Submission", layer: "Thesis Documentation", priority: "High", kind: "milestone", advisor: true, assignees: ["All Team Members"] },
  ].map(({ offset, ...item }) => ({ ...item, project: PROJECT, due: at(offset) }));

  return {
    deadlines,
    advisor: { name: "Dr. Sarah Adams", faculty: "Faculty of Computer Science" },
    meeting: { title: "Sprint 3 Advisor Evaluation", status: "Confirmed", date: at(14, 11, 0), minutes: 45 },
    sprint: { name: "Sprint 3", completed: 8, total: 14, target: at(21) },
  };
}
