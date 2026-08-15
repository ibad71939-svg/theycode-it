import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

export default function Payments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  // Revenue/pending totals come from a dedicated summary endpoint that
  // covers ALL payments, independent of which page is currently shown —
  // summing the paginated `payments` array here would silently only total
  // whatever page happens to be visible.
  const [summary, setSummary] = useState({ revenue: 0, pending: 0 });

  function load() {
    if (!token) return;
    api.get(`/admin/payments?page=${page}&limit=20`, token)
      .then((res) => { setPayments(res.data); setMeta({ totalPages: res.totalPages, total: res.total }); })
      .catch(() => {});
    api.get('/admin/payments/summary', token).then(setSummary).catch(() => {});
  }
  useEffect(load, [token, page]);

  async function markPaid(p) {
    await api.put(`/admin/payments/${p.id}`, { status: 'PAID', method: p.method || 'bank_transfer', transactionRef: p.transactionRef }, token);
    load();
  }

  async function viewReceipt(p) {
    try {
      const { url } = await api.get(`/admin/payments/${p.id}/receipt-url`, token);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert(e.message);
    }
  }

  if (!token) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Payments & Finance</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-5">
          <p className="text-xs text-muted">Revenue Collected</p>
          <p className="text-2xl font-display font-bold mt-1">Rs {summary.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-5">
          <p className="text-xs text-muted">Pending Collection</p>
          <p className="text-2xl font-display font-bold mt-1 text-warn">Rs {summary.pending.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border-2 border-ink/10 rounded-admin overflow-hidden shadow-card">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-ink text-white text-left">
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
                <td className="px-4 py-3 space-x-3">
                  {p.receiptPath && (
                    <button onClick={() => viewReceipt(p)} className="text-brand-dark font-medium hover:underline">View Receipt</button>
                  )}
                  {p.status !== 'PAID' && (
                    <button onClick={() => markPaid(p)} className="text-brand-dark font-medium hover:underline">Mark Paid</button>
                  )}
                  {p.status === 'PAID' && (
                    <Link to={`/admin/payments/${p.id}/voucher`} target="_blank" className="text-brand-dark font-medium hover:underline">
                      Print Voucher
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No payment records yet.</td></tr>}
          </tbody>
        </table>
        </div>
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
      </div>
    </div>
  );
}