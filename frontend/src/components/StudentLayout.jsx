import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, CreditCard } from 'lucide-react';

const iconProps = { className: 'w-5 h-5', strokeWidth: 1.8 };

const links = [
  { to: '/student/dashboard', label: 'Dashboard', short: 'Home', icon: <LayoutDashboard {...iconProps} /> },
  { to: '/student/courses', label: 'My Courses', short: 'Courses', icon: <BookOpen {...iconProps} /> },
  { to: '/student/assignments', label: 'Assignments', short: 'Tasks', icon: <ClipboardList {...iconProps} /> },
  { to: '/student/fees', label: 'Fees', short: 'Fees', icon: <CreditCard {...iconProps} /> },
];

export default function StudentLayout() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-6 md:py-8 grid md:grid-cols-[240px_1fr] gap-8 pb-24 md:pb-8">
      {/* Desktop/tablet sidebar — replaced by the bottom tab bar below on mobile */}
      <aside className="hidden md:block md:sticky md:top-20 md:self-start">
        <div className="bg-ink text-white rounded-card p-4 shadow-card">
          <p className="font-mono text-[11px] uppercase tracking-wider text-white/40 px-2 mb-3">Student Portal</p>
          <div className="space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
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

      <main className="min-w-0"><Outlet /></main>

      {/* Mobile app-style bottom tab bar — fixed, thumb-reachable, safe-area aware */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t border-white/10 pb-safe">
        <div className="grid grid-cols-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                  isActive ? 'text-brand' : 'text-white/50 active:text-white/80'
                }`
              }
            >
              {l.icon}
              <span className="text-[10px] font-semibold tracking-wide">{l.short}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}