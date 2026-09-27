# Gradify

**AI-powered graduation project management platform.**

Vite + React + Tailwind CSS · Mock-first development · Role-based access

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

---

## Folder Structure

```
src/
├── app/                    # Application shell
│   ├── App.jsx             # Root component (ErrorBoundary → BrowserRouter → Providers → Router)
│   ├── router.jsx          # All route definitions with React.lazy + Suspense
│   └── providers.jsx       # Context provider tree (Theme → Auth → Role)
│
├── assets/                 # Static assets (images, fonts, etc.)
│
├── components/             # Shared, reusable components
│   ├── ui/                 # Primitives: Button, Input, Modal, Card, Badge, Table, ThemeToggle
│   ├── layout/             # Navbar, Sidebar, PageHeader
│   └── feedback/           # Toast, EmptyState, Spinner, ErrorState, PageLoader, ErrorBoundary
│
├── layouts/                # Page-level layout shells with <Outlet />
│   ├── AuthLayout.jsx      # Centered card for login/register flows
│   ├── AppLayout.jsx       # Navbar + Sidebar + content area
│   └── SupervisorLayout.jsx# Supervisor-specific variant
│
├── features/               # Feature-sliced modules (see convention below)
│   ├── auth/
│   ├── dashboard/
│   ├── profile/
│   ├── projects/
│   ├── tasks/
│   ├── ai-workspace/
│   ├── documentation/
│   ├── collaboration/
│   ├── supervisor/
│   └── not-found/
│
├── routes/                 # Route guards
│   ├── ProtectedRoute.jsx  # Redirects to /auth/login when not authenticated
│   └── RoleGate.jsx        # Redirects to /dashboard when role not in allowedRoles
│
├── context/                # React contexts
│   ├── AuthContext.jsx      # currentUser, login(), logout(), switchRole()
│   ├── RoleContext.jsx      # Derives role from AuthContext
│   └── ThemeContext.jsx     # Dark/light mode with localStorage persistence
│
├── services/
│   ├── api/                # (future) Real API client modules
│   └── mock/               # Mock service layer — one file per feature
│
├── mocks/data/             # JSON fixture files: users, projects, tasks, meetings, notifications
│
├── hooks/                  # Shared custom hooks: useAuth, useRole, useDebounce, usePagination
│
├── constants/
│   ├── roles.js            # Guest, TeamLeader, TeamMember, Supervisor
│   └── enums.js            # PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY
│
├── utils/                  # Utility/helper functions
└── styles/                 # Additional global styles
```

---

## Feature Slice Convention

Every feature under `features/` follows this structure:

```
features/<feature-name>/
├── pages/          # Page-level components (one per route)
├── components/     # Feature-specific UI components (currently .gitkeep)
└── hooks/          # Feature-specific hooks (currently .gitkeep)
```

### Example: `features/projects/`

```
features/projects/
├── pages/
│   ├── MyProjects.jsx
│   ├── CreateProject.jsx
│   ├── ProjectDetails.jsx
│   ├── EditProject.jsx
│   ├── ProjectSettings.jsx   ← TeamLeader only (RoleGate)
│   ├── InviteMembers.jsx      ← TeamLeader only (RoleGate)
│   └── TeamMembers.jsx
├── components/
│   └── .gitkeep
└── hooks/
    └── .gitkeep
```

Each page component currently renders a minimal `<h1>` with its name so that navigation is immediately testable.

---

## Mock Service Layer

All mock services live in `src/services/mock/` and mirror the shape of future real API calls:

| File                           | Functions                                                      |
| ------------------------------ | -------------------------------------------------------------- |
| `mockAuthService.js`           | `login()`, `register()`, `forgotPassword()`, `getCurrentUser()`|
| `mockProjectsService.js`       | `getProjects()`, `getProjectById()`, `createProject()`, etc.   |
| `mockTasksService.js`          | `getTasks()`, `getTaskById()`, `createTask()`, etc.            |
| `mockAIWorkspaceService.js`    | `uploadSRS()`, `analyzeDocument()`, `chatWithAI()`, etc.       |
| `mockDocumentationService.js`  | `generateReadme()`, `generateSRS()`, `exportPDF()`, etc.       |
| `mockCollaborationService.js`  | `getMeetings()`, `sendMessage()`, `search()`, etc.             |
| `mockSupervisorService.js`     | `getSupervisorDashboard()`, `getAnalytics()`, `getActivityLog()` |

Each function:
- Returns a `Promise`
- Resolves with data from `src/mocks/data/*.json` after a small `setTimeout` delay (simulating network latency)
- Follows the same signature the real API client will use

**To swap for real APIs later**, create matching modules in `services/api/` with the same function signatures, then update imports. No page logic changes required.

---

## Role-Based Access Control

### How It Works

1. **`AuthContext`** holds a `currentUser` object with a `role` property.
2. **`RoleGate`** component wraps routes that require specific roles. It checks `currentUser.role` against an `allowedRoles` array and redirects unauthorized users to `/dashboard`.
3. **`ProtectedRoute`** ensures a user is authenticated at all — unauthenticated users are redirected to `/auth/login`.

### Currently Gated Routes

| Route                        | Allowed Roles   |
| ---------------------------- | --------------- |
| `/projects/:id/settings`     | `TeamLeader`    |
| `/projects/:id/invite`       | `TeamLeader`    |
| `/supervisor`                | `Supervisor`    |
| `/supervisor/analytics`      | `Supervisor`    |
| `/supervisor/activity-log`   | `Supervisor`    |

### Dev Role Switcher

A dropdown in the Navbar lets you switch the mocked user's role at runtime — useful for testing role-gated routes without re-authentication.

---

## Dark Mode

- **Configuration**: `tailwind.config.js` uses `darkMode: 'class'`.
- **ThemeContext** reads/writes the preference to `localStorage` and toggles a `dark` class on `<html>`.
- **First load default**: System preference via `prefers-color-scheme` is used if no `localStorage` value exists.
- **ThemeToggle** button is placed in the Navbar.

---

## Error Handling

- **ErrorBoundary** (class component) wraps the entire app root. Catches render errors and shows a fallback UI with a "Reload page" button.
- **PageLoader** is the `<Suspense>` fallback for all lazy-loaded route components.
- **404 Page** (`features/not-found/pages/NotFound.jsx`) is served by a `path="*"` catch-all route inside the AppLayout tree.

---

## How to Add a New Page to an Existing Feature

1. **Create the page component** in `features/<feature>/pages/NewPage.jsx`:
   ```jsx
   export default function NewPage() {
     return <div><h1>NewPage</h1></div>;
   }
   ```

2. **Add a lazy import** in `app/router.jsx`:
   ```jsx
   const NewPage = lazy(() => import('../features/<feature>/pages/NewPage'));
   ```

3. **Add the `<Route>`** inside the appropriate layout group in the `<Routes>` tree:
   ```jsx
   <Route path="<feature>/new-page" element={<NewPage />} />
   ```
   Wrap with `<RoleGate>` if the page requires specific roles.

4. **(Optional)** Add a sidebar link in `components/layout/Sidebar.jsx`.

5. **Run `npm run dev`** — the new page is available immediately via hot reload.

---

## Available Roles

| Constant        | Value          |
| --------------- | -------------- |
| `ROLES.GUEST`   | `"Guest"`      |
| `ROLES.TEAM_LEADER` | `"TeamLeader"` |
| `ROLES.TEAM_MEMBER` | `"TeamMember"` |
| `ROLES.SUPERVISOR`  | `"Supervisor"` |

## Available Enums

- **Project Status**: `ON_TRACK`, `BEHIND_SCHEDULE`, `COMPLETED`
- **Task Status**: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
- **Task Priority**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

---

## Tech Stack

- **Vite 8** — build tool & dev server
- **React 19** — UI framework
- **Tailwind CSS 4** — utility-first CSS
- **React Router DOM 7** — client-side routing

---

## License

Private — not for redistribution.
