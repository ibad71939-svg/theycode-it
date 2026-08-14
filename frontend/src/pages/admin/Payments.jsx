import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Payments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);

  function load() {
    if (!token) return;
    api.get('/admin/payments', token).then(setPayments).catch(() => {});
  }
  useEffect(load, [token]);

  async function markPaid(p) {
    await api.put(`/admin/payments/${p.id}`, { status: 'PAID', method: p.method || 'bank_transfer', transactionRef: p.transactionRef }, token);
    load();
  }

  if (!token) return <LoadingSpinner fullScreen={false} />;

  const revenue = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Payments & Finance</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-muted/10 rounded-admin p-5">
          <p className="text-xs text-muted">Revenue Collected</p>
          <p className="text-2xl font-display font-bold mt-1">Rs {revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-muted/10 rounded-admin p-5">
          <p className="text-xs text-muted">Pending Collection</p>
          <p className="text-2xl font-display font-bold mt-1 text-warn">Rs {pending.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border border-muted/10 rounded-admin overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-muted/10">
                <td className="px-4 py-3 font-medium">{p.enrollment?.student?.user?.name || '—'}</td>
                <td className="px-4 py-3 text-muted">{p.enrollment?.batch?.course?.title || '—'}</td>
                <td className="px-4 py-3">Rs {p.amount?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    p.status === 'PAID' ? 'bg-brand-tint text-brand-dark' : p.status === 'FAILED' ? 'bg-danger/10 text-danger' : 'bg-warn/10 text-warn'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.status !== 'PAID' && (
                    <button onClick={() => markPaid(p)} className="text-brand-dark font-medium hover:underline">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No payment records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
