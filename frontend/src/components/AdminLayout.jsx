import { NavLink, Outlet } from 'react-router-dom';

const iconClass = 'w-5 h-5';

const groups = [
  { label: 'Academic', links: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { to: '/admin/courses', label: 'Courses & Batches', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M4 5h16v14H4z M4 9h16 M8 5v14" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { to: '/admin/enrollments', label: 'Enrollment Approvals', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M9 12l2 2 4-4m5.62-1.16a10 10 0 11-5.62 5.62" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { to: '/admin/assignments', label: 'Assignments', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M9 5h6M9 8h6M5 2h14v20H5z M9 18l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { to: '/admin/attendance', label: 'Attendance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" strokeLinecap="round" /></svg> },
    { to: '/admin/announcements', label: 'Announcements', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M11 5l-7 7v4h4l7-7M11 5l5-5 3 3-5 5M11 5l3 3" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  ]},
  { label: 'People', links: [
    { to: '/admin/students', label: 'Students', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { to: '/admin/instructors', label: 'Instructors', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.42a12 12 0 01.34 5.84L12 20l-6.5-3.58a12 12 0 01.34-5.84L12 14z" strokeLinejoin="round" /></svg> },
  ]},
  { label: 'Finance', links: [
    { to: '/admin/payments', label: 'Payments', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg> },
  ]},
  { label: 'Growth', links: [
    { to: '/admin/leads', label: 'Leads / CRM', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><path d="M3 3v18h18M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  ]},
  { label: 'Records', links: [
    { to: '/admin/certificates', label: 'Certificates', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}><circle cx="12" cy="8" r="6" /><path d="M8.5 13L6 22l6-3 6 3-2.5-9" strokeLinejoin="round" /></svg> },
  ]},
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-[240px_1fr] gap-8">
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="card p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
          {groups.map((g) => (
            <div key={g.label} className="mb-4 last:mb-0">
              <p className="font-mono text-[11px] font-semibold text-muted uppercase tracking-wider px-3 mb-1.5">{g.label}</p>
              <div className="space-y-1">
                {g.links.map((l) => (
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
          ))}
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
