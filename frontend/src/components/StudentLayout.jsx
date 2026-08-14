import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/student/dashboard', label: 'Dashboard', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" strokeLinecap="round" strokeLinejoin="round" /></svg>
  )},
  { to: '/student/courses', label: 'My Courses', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 5h16v14H4z M4 9h16 M8 5v14" strokeLinecap="round" strokeLinejoin="round" /></svg>
  )},
  { to: '/student/assignments', label: 'Assignments', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 5h6M9 8h6M5 2h14v20H5z M9 18l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  )},
  { to: '/student/fees', label: 'Fees', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
  )},
];

export default function StudentLayout() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 grid md:grid-cols-[240px_1fr] gap-8">
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="card p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted px-2 mb-3">Student Portal</p>
          <div className="space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand text-white' : 'text-ink/70 hover:bg-brand-50 hover:text-brand-700'
                  }`
                }
              >
                {l.icon}
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
