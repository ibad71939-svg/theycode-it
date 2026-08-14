import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard', token).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <p className="text-muted">Loading…</p>;

  const cards = [
    { label: 'Total Students', value: data.totalStudents, color: 'text-ink', bg: 'bg-brand-50', text: 'text-brand', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
    )},
    { label: 'Active Batches', value: data.activeBatches, color: 'text-ink', bg: 'bg-mint-50', text: 'text-mint', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinejoin="round" /></svg>
    )},
    { label: 'Pending Approvals', value: data.pendingApprovals, color: 'text-warn', bg: 'bg-warn-50', text: 'text-warn', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
    )},
    { label: 'Revenue Collected', value: `Rs ${data.revenue.toLocaleString()}`, color: 'text-mint-700', bg: 'bg-mint-50', text: 'text-mint', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
    )},
  ];

  return (
    <div className="animate-fade-up">
      <p className="section-eyebrow mb-2">Control Panel</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{c.label}</p>
              <span className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>{c.icon}</span>
            </div>
            <p className={`text-2xl font-display font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {data.pendingApprovals > 0 && (
        <div className="card border-warn-200 bg-warn-50 p-5 mt-6 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-warn">You have {data.pendingApprovals} enrollment{data.pendingApprovals !== 1 ? 's' : ''} waiting for approval</p>
            <p className="text-sm text-muted mt-1">Review and approve pending student applications.</p>
          </div>
          <Link to="/admin/enrollments" className="btn-primary !py-2 !px-4 text-sm">Review →</Link>
        </div>
      )}
    </div>
  );
}
