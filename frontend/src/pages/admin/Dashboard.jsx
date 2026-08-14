import { useEffect, useState } from 'react';
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
    { label: 'Total Students', value: data.totalStudents },
    { label: 'Active Batches', value: data.activeBatches },
    { label: 'Pending Approvals', value: data.pendingApprovals, warn: true },
    { label: 'Revenue Collected', value: `Rs ${data.revenue.toLocaleString()}` },
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-brand-dark mb-2">Control Panel</p>
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-ink/10 rounded-admin p-5">
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{c.label}</p>
            <p className={`text-2xl font-display font-bold mt-1 ${c.warn ? 'text-warn' : 'text-ink'}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
