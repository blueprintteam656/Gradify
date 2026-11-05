import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/ai-workspace', label: 'AI Workspace' },
  { to: '/documentation', label: 'Docs' },
  { to: '/collaboration', label: 'Collaboration' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full flex-col px-4 py-6">
     <ul className="flex flex-col gap-2">
        {navItems.map((item) => (
          <li key={item.to}>
            
<NavLink
  to={item.to}
  className={({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium no-underline transition-colors ${
      isActive
        ? "bg-[#6256E8] text-white"
        : "text-[#AAB6D0] hover:bg-white/10 hover:text-white"
    }`
  }
>
  {item.label}
</NavLink>

          </li>
        ))}
    </ul>
    </aside>
  );
}
