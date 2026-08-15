import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Layers, Clock, Wallet, ArrowRight, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { SkeletonStatRow } from '../../components/Skeleton';

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard', token).then(setData).catch(() => {});
  }, [token]);

  if (!data) {
    return (
      <div>
        <p className="section-eyebrow mb-2">Control Panel</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
        <SkeletonStatRow count={4} />
      </div>
    );
  }

  const cards = [
    { label: 'Total Students', value: data.totalStudents, color: 'text-ink', bg: 'bg-ink', text: 'text-white', icon: <Users className="w-5 h-5" strokeWidth={1.8} /> },
    { label: 'Active Batches', value: data.activeBatches, color: 'text-ink', bg: 'bg-brand', text: 'text-white', icon: <Layers className="w-5 h-5" strokeWidth={1.8} /> },
    { label: 'Pending Approvals', value: data.pendingApprovals, color: 'text-warn-700', bg: 'bg-warn', text: 'text-white', icon: <Clock className="w-5 h-5" strokeWidth={1.8} /> },
    { label: 'Revenue Collected', value: `Rs ${data.revenue.toLocaleString()}`, color: 'text-brand-700', bg: 'bg-brand-700', text: 'text-white', icon: <Wallet className="w-5 h-5" strokeWidth={1.8} /> },
  ];

  return (
    <div className="animate-fade-up">
      <p className="section-eyebrow mb-2">Control Panel</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={c.label} className={`stat-card animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[11px] uppercase tracking-wide text-neutral-500">{c.label}</p>
              <span className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>{c.icon}</span>
            </div>
            <p className={`text-2xl font-display font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {data.pendingApprovals > 0 && (
        <div className="card border-warn-200 bg-warn-50 p-5 mt-6 flex items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-warn text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" strokeWidth={2} />
            </span>
            <div>
              <p className="font-display font-bold text-warn-700">You have {data.pendingApprovals} enrollment{data.pendingApprovals !== 1 ? 's' : ''} waiting for approval</p>
              <p className="text-sm text-neutral-600 mt-1">Review and approve pending student applications.</p>
            </div>
          </div>
          <Link to="/admin/enrollments" className="btn-primary !py-2 !px-4 text-sm shrink-0 whitespace-nowrap">
            Review <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
          </Link>
        </div>
      )}
    </div>
  );
}