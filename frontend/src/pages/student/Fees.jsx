import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function Fees() {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get('/student/enrollments', token).then(setEnrollments).catch(() => {});
  }, [token]);

  const payments = enrollments.flatMap((e) => (e.payments || []).map((p) => ({ ...p, courseTitle: e.batch?.course?.title })));
  const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="animate-fade-up">
      <p className="section-eyebrow mb-2">Student Portal</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Fee History</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-mint-50 text-mint flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M9 12l2 2 4-4m5.62-1.16a10 10 0 11-5.62 5.62" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Total Paid</p>
          </div>
          <p className="text-2xl font-display font-bold text-mint-700">Rs {totalPaid.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-warn-50 text-warn flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
            </span>
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Pending</p>
          </div>
          <p className="text-2xl font-display font-bold text-warn">Rs {totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm table-clean">
          <thead>
            <tr>
              <th>Course</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.courseTitle}</td>
                <td className="font-display font-bold">Rs {p.amount?.toLocaleString()}</td>
                <td className="text-muted capitalize">{p.method}</td>
                <td>
                  <span className={`pill ${
                    p.status === 'PAID' ? 'bg-mint-50 text-mint-700' :
                    p.status === 'FAILED' ? 'bg-danger-50 text-danger' :
                    'bg-warn-50 text-warn'
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={4} className="text-center text-muted py-8">No payment records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
