import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/courses', label: 'My Courses' },
  { to: '/student/assignments', label: 'Assignments' },
  { to: '/student/fees', label: 'Fees' },
];

export default function StudentLayout() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[200px_1fr] gap-8">
      <aside>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted px-4 mb-2">Student Portal</p>
        <div className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-card text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand text-white' : 'text-ink/70 hover:bg-brand-tint hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
