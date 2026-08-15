import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, CheckCircle2, Wallet, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { SkeletonStatRow, SkeletonCard } from '../../components/Skeleton';

const STATUS_PILL = {
  APPROVED: 'pill-success',
  ACTIVE: 'pill-success',
  REJECTED: 'pill-danger',
};

export default function Dashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/student/dashboard', token).then(setData).catch(() => {});
  }, [token]);

  if (!data) {
    return (
      <div>
        <p className="section-eyebrow mb-2">Student Portal</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Welcome back</h1>
        <p className="text-neutral-500 mb-8">Here's where you stand right now.</p>
        <div className="mb-10"><SkeletonStatRow count={3} /></div>
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Enrolled Courses', value: data.totalCourses, color: 'text-ink', bg: 'bg-ink', icon: <Layers className="w-5 h-5" strokeWidth={1.8} /> },
    { label: 'Active Courses', value: data.activeCourses, color: 'text-brand-700', bg: 'bg-brand', icon: <CheckCircle2 className="w-5 h-5" strokeWidth={1.8} /> },
    { label: 'Fees Pending', value: `Rs ${data.pendingFees.toLocaleString()}`, color: 'text-warn-700', bg: 'bg-warn', icon: <Wallet className="w-5 h-5" strokeWidth={1.8} /> },
  ];

  return (
    <div className="animate-fade-up">
      <p className="section-eyebrow mb-2">Student Portal</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
      <p className="text-neutral-500 mb-8">Here's where you stand right now.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {cards.map((c, i) => (
          <div key={c.label} className={`stat-card animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[11px] uppercase tracking-wide text-neutral-500">{c.label}</p>
              <span className={`w-9 h-9 rounded-xl ${c.bg} text-white flex items-center justify-center`}>{c.icon}</span>
            </div>
            <p className={`text-2xl font-display font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold">Your Enrollments</h2>
        <Link to="/courses" className="text-sm font-semibold text-brand-700 hover:text-brand-600 inline-flex items-center gap-1">
          Browse courses <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
        </Link>
      </div>
      <div className="space-y-3">
        {data.enrollments.map((e) => (
          <div key={e.id} className="card p-4 flex justify-between items-center hover:shadow-card transition-all">
            <div>
              <p className="font-semibold">{e.batch?.course?.title}</p>
              <p className="text-sm text-neutral-500">{e.batch?.schedule}</p>
            </div>
            <span className={STATUS_PILL[e.status] || 'pill-warn'}>{e.status}</span>
          </div>
        ))}
        {data.enrollments.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-neutral-500 mb-4">No enrollments yet — browse the catalog to get started.</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}