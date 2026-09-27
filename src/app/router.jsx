import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../routes/ProtectedRoute';
import GuestRoute from '../routes/GuestRoute';
import RoleGate from '../routes/RoleGate';
import PageLoader from '../components/feedback/PageLoader';
import { ROLES } from '../constants/roles';

// ── Auth pages ──────────────────────────────────────────────
const Login = lazy(() => import('../features/auth/pages/Login'));
const Register = lazy(() => import('../features/auth/pages/Register'));
const ForgotPassword = lazy(() => import('../features/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../features/auth/pages/ResetPassword'));
const EmailVerification = lazy(() => import('../features/auth/pages/EmailVerification'));
const AccountCreated = lazy(() => import('../features/auth/pages/AccountCreated'));

// ── Dashboard pages ─────────────────────────────────────────
const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'));
const Notifications = lazy(() => import('../features/dashboard/pages/Notifications'));
const RecentActivity = lazy(() => import('../features/dashboard/pages/RecentActivity'));
const UpcomingDeadlines = lazy(() => import('../features/dashboard/pages/UpcomingDeadlines'));
const QuickActions = lazy(() => import('../features/dashboard/pages/QuickActions'));

// ── Profile pages ───────────────────────────────────────────
const UserProfile = lazy(() => import('../features/profile/pages/UserProfile'));
const EditProfile = lazy(() => import('../features/profile/pages/EditProfile'));
const Settings = lazy(() => import('../features/profile/pages/Settings'));
const ChangePassword = lazy(() => import('../features/profile/pages/ChangePassword'));

// ── Projects pages ──────────────────────────────────────────
const MyProjects = lazy(() => import('../features/projects/pages/MyProjects'));
const CreateProject = lazy(() => import('../features/projects/pages/CreateProject'));
const ProjectDetails = lazy(() => import('../features/projects/pages/ProjectDetails'));
const EditProject = lazy(() => import('../features/projects/pages/EditProject'));
const ProjectSettings = lazy(() => import('../features/projects/pages/ProjectSettings'));
const InviteMembers = lazy(() => import('../features/projects/pages/InviteMembers'));
const TeamMembers = lazy(() => import('../features/projects/pages/TeamMembers'));

// ── Tasks pages ─────────────────────────────────────────────
const TaskList = lazy(() => import('../features/tasks/pages/TaskList'));
const TaskDetails = lazy(() => import('../features/tasks/pages/TaskDetails'));
const CreateTask = lazy(() => import('../features/tasks/pages/CreateTask'));
const EditTask = lazy(() => import('../features/tasks/pages/EditTask'));
const Subtasks = lazy(() => import('../features/tasks/pages/Subtasks'));
const KanbanBoard = lazy(() => import('../features/tasks/pages/KanbanBoard'));
const Calendar = lazy(() => import('../features/tasks/pages/Calendar'));
const SprintBoard = lazy(() => import('../features/tasks/pages/SprintBoard'));

// ── AI Workspace pages ──────────────────────────────────────
const UploadSRS = lazy(() => import('../features/ai-workspace/pages/UploadSRS'));
const AIAnalyzer = lazy(() => import('../features/ai-workspace/pages/AIAnalyzer'));
const GeneratedModules = lazy(() => import('../features/ai-workspace/pages/GeneratedModules'));
const GeneratedTasks = lazy(() => import('../features/ai-workspace/pages/GeneratedTasks'));
const AIRoadmap = lazy(() => import('../features/ai-workspace/pages/AIRoadmap'));
const AIChatAssistant = lazy(() => import('../features/ai-workspace/pages/AIChatAssistant'));
const MeetingSummary = lazy(() => import('../features/ai-workspace/pages/MeetingSummary'));
const AIRecommendations = lazy(() => import('../features/ai-workspace/pages/AIRecommendations'));

// ── Documentation pages ─────────────────────────────────────
const DocumentationHome = lazy(() => import('../features/documentation/pages/DocumentationHome'));
const ReadmeGenerator = lazy(() => import('../features/documentation/pages/ReadmeGenerator'));
const SRSGenerator = lazy(() => import('../features/documentation/pages/SRSGenerator'));
const ReportGenerator = lazy(() => import('../features/documentation/pages/ReportGenerator'));
const ExportPDF = lazy(() => import('../features/documentation/pages/ExportPDF'));
const VersionHistory = lazy(() => import('../features/documentation/pages/VersionHistory'));
const DiagramSuggestions = lazy(() => import('../features/documentation/pages/DiagramSuggestions'));

// ── Collaboration pages ─────────────────────────────────────
const TeamChat = lazy(() => import('../features/collaboration/pages/TeamChat'));
const Meetings = lazy(() => import('../features/collaboration/pages/Meetings'));
const MeetingNotes = lazy(() => import('../features/collaboration/pages/MeetingNotes'));
const FilePreview = lazy(() => import('../features/collaboration/pages/FilePreview'));
const FileVersions = lazy(() => import('../features/collaboration/pages/FileVersions'));
const UnifiedSearch = lazy(() => import('../features/collaboration/pages/UnifiedSearch'));

// ── Supervisor pages ────────────────────────────────────────
const SupervisorDashboard = lazy(() => import('../features/supervisor/pages/SupervisorDashboard'));
const Analytics = lazy(() => import('../features/supervisor/pages/Analytics'));
const ActivityLog = lazy(() => import('../features/supervisor/pages/ActivityLog'));

// ── Not Found ───────────────────────────────────────────────
const NotFound = lazy(() => import('../features/not-found/pages/NotFound'));

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public / Auth routes ─────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Sign-up flow (centered layout, rendered by each page) */}
        <Route element={<GuestRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerification />} />
        </Route>
        {/* Handles its own redirect: it signs the user in, then continues to the chosen page */}
        <Route path="/welcome" element={<AccountCreated />} />
        <Route path="/auth/register" element={<Navigate to="/register" replace />} />
        <Route path="/auth/verify-email" element={<Navigate to="/register" replace />} />

        {/* ── Protected / App routes ───────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Root redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/notifications" element={<Notifications />} />
          <Route path="dashboard/recent-activity" element={<RecentActivity />} />
          <Route path="dashboard/upcoming-deadlines" element={<UpcomingDeadlines />} />
          <Route path="dashboard/quick-actions" element={<QuickActions />} />

          {/* Profile */}
          <Route path="profile" element={<UserProfile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="profile/settings" element={<Settings />} />
          <Route path="profile/change-password" element={<ChangePassword />} />

          {/* Projects */}
          <Route path="projects" element={<MyProjects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="projects/:id/edit" element={<EditProject />} />
          <Route
            path="projects/:id/settings"
            element={
              <RoleGate allowedRoles={[ROLES.TEAM_LEADER]}>
                <ProjectSettings />
              </RoleGate>
            }
          />
          <Route
            path="projects/:id/invite"
            element={
              <RoleGate allowedRoles={[ROLES.TEAM_LEADER]}>
                <InviteMembers />
              </RoleGate>
            }
          />
          <Route path="projects/:id/members" element={<TeamMembers />} />

          {/* Tasks */}
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="tasks/create" element={<CreateTask />} />
          <Route path="tasks/:id/edit" element={<EditTask />} />
          <Route path="tasks/:id/subtasks" element={<Subtasks />} />
          <Route path="tasks/kanban" element={<KanbanBoard />} />
          <Route path="tasks/calendar" element={<Calendar />} />
          <Route path="tasks/sprint" element={<SprintBoard />} />

          {/* AI Workspace */}
          <Route path="ai-workspace/upload" element={<UploadSRS />} />
          <Route path="ai-workspace/analyzer" element={<AIAnalyzer />} />
          <Route path="ai-workspace/modules" element={<GeneratedModules />} />
          <Route path="ai-workspace/tasks" element={<GeneratedTasks />} />
          <Route path="ai-workspace/roadmap" element={<AIRoadmap />} />
          <Route path="ai-workspace/chat" element={<AIChatAssistant />} />
          <Route path="ai-workspace/meeting-summary" element={<MeetingSummary />} />
          <Route path="ai-workspace/recommendations" element={<AIRecommendations />} />

          {/* Documentation */}
          <Route path="documentation" element={<DocumentationHome />} />
          <Route path="documentation/readme" element={<ReadmeGenerator />} />
          <Route path="documentation/srs" element={<SRSGenerator />} />
          <Route path="documentation/report" element={<ReportGenerator />} />
          <Route path="documentation/export-pdf" element={<ExportPDF />} />
          <Route path="documentation/history" element={<VersionHistory />} />
          <Route path="documentation/diagrams" element={<DiagramSuggestions />} />

          {/* Collaboration */}
          <Route path="collaboration/chat" element={<TeamChat />} />
          <Route path="collaboration/meetings" element={<Meetings />} />
          <Route path="collaboration/meetings/:id/notes" element={<MeetingNotes />} />
          <Route path="collaboration/files/:id" element={<FilePreview />} />
          <Route path="collaboration/files/:id/versions" element={<FileVersions />} />
          <Route path="collaboration/search" element={<UnifiedSearch />} />

          {/* Supervisor — Supervisor role only */}
          <Route
            path="supervisor"
            element={
              <RoleGate allowedRoles={[ROLES.SUPERVISOR]}>
                <SupervisorDashboard />
              </RoleGate>
            }
          />
          <Route
            path="supervisor/analytics"
            element={
              <RoleGate allowedRoles={[ROLES.SUPERVISOR]}>
                <Analytics />
              </RoleGate>
            }
          />
          <Route
            path="supervisor/activity-log"
            element={
              <RoleGate allowedRoles={[ROLES.SUPERVISOR]}>
                <ActivityLog />
              </RoleGate>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Catch-all outside layouts */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
