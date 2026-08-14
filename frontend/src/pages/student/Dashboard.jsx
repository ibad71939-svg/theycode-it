import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/student/dashboard', token).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <LoadingSpinner fullScreen={false} />;

  const cards = [
    { label: 'Enrolled Courses', value: data.totalCourses, color: 'text-ink', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 5h16v14H4z M4 9h16 M8 5v14" strokeLinecap="round" strokeLinejoin="round" /></svg>
    )},
    { label: 'Active Courses', value: data.activeCourses, color: 'text-brand-700', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12l2 2 4-4m5.62-1.16a10 10 0 11-5.62 5.62" strokeLinecap="round" strokeLinejoin="round" /></svg>
    )},
    { label: 'Fees Pending', value: `Rs ${data.pendingFees.toLocaleString()}`, color: 'text-warn', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
    )},
  ];

  return (
    <div className="animate-fade-up">
      <p className="section-eyebrow mb-2">Student Portal</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
      <p className="text-muted mb-8">Here's where you stand right now.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{c.label}</p>
              <span className="text-muted">{c.icon}</span>
            </div>
            <p className={`text-2xl font-display font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold">Your Enrollments</h2>
        <Link to="/courses" className="text-sm font-semibold text-brand-700 hover:text-brand-600">Browse courses →</Link>
      </div>
      <div className="space-y-3">
        {data.enrollments.map((e) => (
          <div key={e.id} className="card p-4 flex justify-between items-center hover:shadow-card transition-all">
            <div>
              <p className="font-semibold">{e.batch?.course?.title}</p>
              <p className="text-sm text-muted">{e.batch?.schedule}</p>
            </div>
            <span
              className={`pill ${
                e.status === 'APPROVED' || e.status === 'ACTIVE'
                  ? 'bg-mint-50 text-mint-700'
                  : e.status === 'REJECTED'
                  ? 'bg-danger-50 text-danger'
                  : 'bg-warn-50 text-warn'
              }`}
            >
              {e.status}
            </span>
          </div>
        ))}
        {data.enrollments.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-muted mb-4">No enrollments yet — browse the catalog to get started.</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
