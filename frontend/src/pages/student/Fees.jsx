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

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Fee History</h1>
      <div className="bg-white border border-muted/10 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Course</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-muted/10">
                <td className="px-5 py-3">{p.courseTitle}</td>
                <td className="px-5 py-3 font-medium">Rs {p.amount?.toLocaleString()}</td>
                <td className="px-5 py-3 text-muted">{p.method}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    p.status === 'PAID' ? 'bg-brand-tint text-brand-dark' : p.status === 'FAILED' ? 'bg-danger/10 text-danger' : 'bg-warn/10 text-warn'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-muted">No payment records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
