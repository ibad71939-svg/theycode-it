import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Attendance() {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [marked, setMarked] = useState({}); // enrollmentId -> status just set, for instant feedback
  const [loaded, setLoaded] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get('/admin/batches', token).then(setBatches).catch(() => {}).finally(() => setLoaded(true));
  }, [token]);

  useEffect(() => {
    if (!batchId) { setEnrollments([]); return; }
    setLoadingEnrollments(true);
    api.get(`/admin/enrollments?batchId=${batchId}`, token).then(setEnrollments).catch(() => {}).finally(() => setLoadingEnrollments(false));
  }, [batchId, token]);

  async function mark(enrollmentId, status) {
    await api.post('/admin/attendance', {
      enrollmentId,
      batchId,
      sessionDate: new Date().toISOString(),
      status,
    }, token);
    setMarked((m) => ({ ...m, [enrollmentId]: status }));
  }

  function batchLabel(b) {
    return `${b.course?.title || 'Course'} — ${b.schedule || ''}`;
  }

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Mark Attendance</h1>
      <p className="text-sm text-muted mb-4">Marking attendance for today, {new Date().toLocaleDateString()}.</p>

      <Field label="Batch" className="mb-6 w-full sm:w-96">
        <select name="batchId" className="w-full border border-muted/20 rounded-admin px-3 py-2"
          value={batchId} onChange={(e) => setBatchId(e.target.value)}>
          <option value="">Select a batch…</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{batchLabel(b)}</option>)}
        </select>
      </Field>

      {batchId && loadingEnrollments && <LoadingSpinner fullScreen={false} size="md" />}

      {batchId && !loadingEnrollments && (
        <div className="space-y-3">
          {enrollments.filter((e) => e.status === 'APPROVED' || e.status === 'ACTIVE').map((e) => (
            <div key={e.id} className="bg-white border border-muted/10 rounded-admin p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{e.student?.user?.name}</p>
                <p className="text-xs text-muted">{e.student?.user?.email}</p>
              </div>
              <div className="flex gap-2">
                {['present', 'absent', 'late'].map((s) => (
                  <button
                    key={s}
                    onClick={() => mark(e.id, s)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${
                      marked[e.id] === s ? 'bg-brand text-white border-brand' : 'border-muted/20 text-muted hover:border-brand'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {enrollments.filter((e) => e.status === 'APPROVED' || e.status === 'ACTIVE').length === 0 && (
            <p className="text-muted">No active students enrolled in this batch.</p>
          )}
        </div>
      )}
    </div>
  );
}