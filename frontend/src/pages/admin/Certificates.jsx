import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Certificates() {
  const { token } = useAuth();
  const [eligible, setEligible] = useState([]);
  const [issued, setIssued] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [lastIssued, setLastIssued] = useState(null);
  const [loaded, setLoaded] = useState(false);

  function load() {
    if (!token) return;
    Promise.all([
      api.get('/admin/enrollments', token).then((all) =>
        setEligible(all.filter((e) => ['APPROVED', 'ACTIVE', 'COMPLETED'].includes(e.status)))
      ).catch(() => {}),
      api.get('/admin/certificates', token).then(setIssued).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }
  useEffect(load, [token]);

  async function issue(e) {
    e.preventDefault();
    if (!enrollmentId) return;
    const cert = await api.post('/admin/certificates', { enrollmentId }, token);
    setLastIssued(cert);
    setEnrollmentId('');
    load();
  }

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Issue Certificate</h1>

      {lastIssued && (
        <div className="bg-brand-tint border border-brand/30 rounded-admin p-4 mb-6 text-sm">
          <p className="font-semibold text-brand-dark">Certificate issued</p>
          <p className="font-mono mt-1">{lastIssued.verificationCode}</p>
        </div>
      )}

      <form onSubmit={issue} className="bg-white border border-muted/10 rounded-admin p-5 mb-8 flex gap-3 items-end">
        <div className="flex-1">
          <Field label="Student enrollment" required>
            <select name="enrollmentId" required className="w-full border border-muted/20 rounded-admin px-3 py-2"
              value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)}>
              <option value="">Select a student's enrollment…</option>
              {eligible.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.student?.user?.name} — {e.batch?.course?.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button className="bg-brand text-white font-semibold px-6 py-2 rounded-admin hover:bg-brand-dark">Issue</button>
      </form>

      <h2 className="font-display text-lg font-bold mb-4">Issued Certificates</h2>
      <div className="bg-white border border-muted/10 rounded-admin overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
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
                <td className="px-4 py-3 text-muted">{new Date(c.issuedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {issued.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">No certificates issued yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}