import { useEffect, useState } from 'react';
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

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-brand-dark mb-2">Student Portal</p>
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
      <p className="text-muted mb-8">Here's where you stand right now.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="card p-5">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Enrolled Courses</p>
          <p className="text-2xl font-display font-bold mt-1">{data.totalCourses}</p>
        </div>
        <div className="card p-5">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Active Courses</p>
          <p className="text-2xl font-display font-bold mt-1 text-brand-dark">{data.activeCourses}</p>
        </div>
        <div className="card p-5">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Fees Pending</p>
          <p className="text-2xl font-display font-bold mt-1 text-warn">Rs {data.pendingFees.toLocaleString()}</p>
        </div>
      </div>

      <h2 className="font-display text-lg font-bold mb-4">Your Enrollments</h2>
      <div className="space-y-3">
        {data.enrollments.map((e) => (
          <div key={e.id} className="card p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{e.batch?.course?.title}</p>
              <p className="text-sm text-muted">{e.batch?.schedule}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                e.status === 'APPROVED' || e.status === 'ACTIVE'
                  ? 'bg-mint-tint text-mint-dark'
                  : e.status === 'REJECTED'
                  ? 'bg-danger/10 text-danger'
                  : 'bg-warn/10 text-warn'
              }`}
            >
              {e.status}
            </span>
          </div>
        ))}
        {data.enrollments.length === 0 && <p className="text-muted">No enrollments yet — browse the catalog to get started.</p>}
      </div>
    </div>
  );
}
