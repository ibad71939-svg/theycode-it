import { NavLink, Outlet } from 'react-router-dom';

const groups = [
  { label: 'Academic', links: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/courses', label: 'Courses & Batches' },
    { to: '/admin/enrollments', label: 'Enrollment Approvals' },
    { to: '/admin/assignments', label: 'Assignments' },
    { to: '/admin/attendance', label: 'Attendance' },
    { to: '/admin/announcements', label: 'Announcements' },
  ]},
  { label: 'People', links: [
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/instructors', label: 'Instructors' },
  ]},
  { label: 'Finance', links: [
    { to: '/admin/payments', label: 'Payments' },
  ]},
  { label: 'Growth', links: [
    { to: '/admin/leads', label: 'Leads / CRM' },
  ]},
  { label: 'Records', links: [
    { to: '/admin/certificates', label: 'Certificates' },
  ]},
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="font-mono text-[11px] font-semibold text-muted uppercase tracking-wider px-4 mb-1.5">{g.label}</p>
            <div className="space-y-1">
              {g.links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-admin text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand text-white' : 'text-ink/70 hover:bg-brand-tint hover:text-ink'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
