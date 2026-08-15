import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Certificates() {
  const { token } = useAuth();
  const [eligible, setEligible] = useState([]);
  const [issued, setIssued] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [lastIssued, setLastIssued] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState('');

  function load() {
    if (!token) return;
    Promise.all([
      // GET /admin/enrollments is paginated — it returns
      // { data, page, limit, total, totalPages }, not a bare array.
      api.get('/admin/enrollments?limit=100', token).then((res) =>
        setEligible(res.data.filter((e) => ['APPROVED', 'ACTIVE', 'COMPLETED'].includes(e.status)))
      ).catch(() => {}),
      api.get('/admin/certificates', token).then(setIssued).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }
  useEffect(load, [token]);

  // Enrollments that already have a certificate on file don't need to show
  // up in the picker again.
  const issuedEnrollmentIds = new Set(issued.map((c) => c.enrollmentId));
  const availableToIssue = eligible.filter((e) => !issuedEnrollmentIds.has(e.id));

  async function issue(e) {
    e.preventDefault();
    if (!enrollmentId) return;
    setError('');
    setIssuing(true);
    try {
      const cert = await api.post('/admin/certificates', { enrollmentId }, token);
      setLastIssued(cert);
      setEnrollmentId('');
      load();
    } catch (err) {
      setError(err.message || 'Could not issue certificate.');
    } finally {
      setIssuing(false);
    }
  }

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Certificates</h1>

      <form onSubmit={issue} className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-5 mb-8">
        <h2 className="font-display text-lg font-bold mb-4">Issue a Certificate</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-ink block mb-1.5">Enrollment</label>
            <select
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            >
              <option value="">Select a completed enrollment…</option>
              {availableToIssue.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.student?.user?.name || 'Unknown student'} — {e.batch?.course?.title || 'Unknown course'}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={!enrollmentId || issuing} className="btn-primary disabled:opacity-60">
            {issuing ? 'Issuing…' : 'Issue Certificate'}
          </button>
        </div>
        {availableToIssue.length === 0 && (
          <p className="text-sm text-muted mt-3">
            No approved, active, or completed enrollments are waiting on a certificate right now.
          </p>
        )}
        {error && <p className="text-danger text-sm mt-3">{error}</p>}
        {lastIssued && !error && (
          <p className="text-sm text-brand-700 mt-3">
            Issued certificate <span className="font-mono">{lastIssued.verificationCode}</span>.
          </p>
        )}
      </form>

      <h2 className="font-display text-lg font-bold mb-4">Issued Certificates</h2>
      <div className="bg-white border-2 border-ink/10 rounded-admin overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-ink text-white text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody>
              {issued.map((c) => (
                <tr key={c.id} className="border-t border-muted/10">
                  <td className="px-4 py-3 font-medium">{c.studentName}</td>
                  <td className="px-4 py-3 text-muted">{c.courseTitle}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.verificationCode}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(c.issuedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {issued.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    No certificates issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
