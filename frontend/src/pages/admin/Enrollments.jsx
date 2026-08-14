import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Enrollments() {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState('PENDING');

  function load() {
    if (!token) return;
    api.get(`/admin/enrollments${filter ? `?status=${filter}` : ''}`, token).then(setEnrollments).catch(() => {});
  }
  useEffect(load, [token, filter]);

  async function updateStatus(id, status) {
    await api.put(`/admin/enrollments/${id}/status`, { status }, token);
    load();
  }

  if (!token) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Enrollment Approvals</h1>
      <div className="flex gap-2 mb-6">
        {['PENDING', 'APPROVED', 'REJECTED', ''].map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border ${filter === s ? 'bg-brand text-white border-brand' : 'border-muted/20 text-muted'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {enrollments.map((e) => (
          <div key={e.id} className="bg-white border border-muted/10 rounded-admin p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{e.student?.user?.name} <span className="text-muted font-normal">· {e.student?.user?.email}</span></p>
              <p className="text-sm text-muted mt-1">{e.batch?.course?.title} — {e.batch?.schedule}</p>
              <p className="text-xs text-muted mt-1">Fee: Rs {e.payments?.[0]?.amount?.toLocaleString()} ({e.payments?.[0]?.status})</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-warn/10 text-warn">{e.status}</span>
              {e.status === 'PENDING' && (
                <>
                  <button onClick={() => updateStatus(e.id, 'APPROVED')} className="text-sm font-semibold bg-brand text-white px-3 py-1.5 rounded-admin hover:bg-brand-dark">Approve</button>
                  <button onClick={() => updateStatus(e.id, 'REJECTED')} className="text-sm font-semibold border border-danger text-danger px-3 py-1.5 rounded-admin hover:bg-danger/5">Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
        {enrollments.length === 0 && <p className="text-muted">No enrollments in this filter.</p>}
      </div>
    </div>
  );
}
