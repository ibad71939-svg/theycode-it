import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layers, CheckSquare, ClipboardList, CalendarCheck,
  Megaphone, Users, GraduationCap, CreditCard, Target, Award, Settings, Menu, X,
} from 'lucide-react';

const iconProps = { className: 'w-5 h-5', strokeWidth: 1.8 };

const groups = [
  { label: 'Academic', links: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard {...iconProps} /> },
    { to: '/admin/courses', label: 'Courses & Batches', icon: <Layers {...iconProps} /> },
    { to: '/admin/enrollments', label: 'Enrollment Approvals', icon: <CheckSquare {...iconProps} /> },
    { to: '/admin/assignments', label: 'Assignments', icon: <ClipboardList {...iconProps} /> },
    { to: '/admin/attendance', label: 'Attendance', icon: <CalendarCheck {...iconProps} /> },
    { to: '/admin/announcements', label: 'Announcements', icon: <Megaphone {...iconProps} /> },
  ]},
  { label: 'People', links: [
    { to: '/admin/students', label: 'Students', icon: <Users {...iconProps} /> },
    { to: '/admin/instructors', label: 'Instructors', icon: <GraduationCap {...iconProps} /> },
  ]},
  { label: 'Finance', links: [
    { to: '/admin/payments', label: 'Payments', icon: <CreditCard {...iconProps} /> },
  ]},
  { label: 'Growth', links: [
    { to: '/admin/leads', label: 'Leads / CRM', icon: <Target {...iconProps} /> },
  ]},
  { label: 'Records', links: [
    { to: '/admin/certificates', label: 'Certificates', icon: <Award {...iconProps} /> },
  ]},
  { label: 'System', links: [
    { to: '/admin/settings', label: 'Settings', icon: <Settings {...iconProps} /> },
  ]},
];

function SidebarNav({ onLinkClick }) {
  return (
    <>
      {groups.map((g) => (
        <div key={g.label} className="mb-4 last:mb-0">
          <p className="font-mono text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-1.5">{g.label}</p>
          <div className="space-y-1">
            {g.links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={onLinkClick}
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
      ))}
    </>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the drawer automatically whenever the route changes (e.g. after
  // tapping a link), so it never lingers open over the next page.
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const activeLabel = groups.flatMap((g) => g.links).find((l) => location.pathname.startsWith(l.to))?.label || 'Admin';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-6 md:py-8">
      {/* Mobile top bar: current section name + hamburger to open the nav drawer */}
      <div className="md:hidden flex items-center justify-between mb-5">
        <h1 className="font-display text-xl font-bold">{activeLabel}</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -mr-2 text-ink/70 hover:text-brand-700"
          aria-label="Open admin menu"
        >
          <Menu className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block md:sticky md:top-20 md:self-start">
          <div className="bg-ink text-white rounded-card p-4 max-h-[calc(100vh-7rem)] overflow-y-auto shadow-card">
            <SidebarNav />
          </div>
        </aside>

        <main className="min-w-0"><Outlet /></main>
      </div>

      {/* Mobile nav drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-ink overflow-y-auto p-3 animate-fade-up"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
          >
            <div className="flex items-center justify-between px-2 mb-3">
              <p className="font-display font-bold text-white text-sm">Admin Menu</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 -mr-2 text-white/60 hover:text-white"
                aria-label="Close admin menu"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <SidebarNav onLinkClick={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}