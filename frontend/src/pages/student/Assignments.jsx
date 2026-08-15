import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Assignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [status, setStatus] = useState('');
  const [loaded, setLoaded] = useState(false);

  function load() {
    api.get('/student/assignments', token).then(setAssignments).catch(() => {}).finally(() => setLoaded(true));
  }
  useEffect(load, [token]);

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  async function submit(id) {
    try {
      await api.post(`/student/assignments/${id}/submit`, { fileUrl: 'uploaded-file-placeholder.pdf' }, token);
      setStatus('Submitted!');
      load();
    } catch (e) {
      setStatus(e.message);
    }
  }

  return (
    <div className="animate-fade-up">
      <p className="section-eyebrow mb-2">Student Portal</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Assignments</h1>
      {status && <p className="text-brand-700 text-sm mb-4 bg-brand-50 px-3 py-2 rounded-lg">{status}</p>}
      <div className="space-y-4">
        {assignments.map((a) => {
          const mySubmission = a.submissions?.[0];
          return (
            <div key={a.id} className="card p-5 hover:shadow-card transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-display font-bold">{a.title}</h3>
                  <p className="text-sm text-muted mt-1">{a.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-muted font-mono">
                      Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}
                    </span>
                    <span className="text-xs text-muted font-mono">Max marks: {a.maxMarks}</span>
                  </div>
                </div>
                {mySubmission ? (
                  <span className={`pill ${mySubmission.marksObtained != null ? 'bg-mint-50 text-mint-700' : 'bg-brand-50 text-brand-700'}`}>
                    {mySubmission.marksObtained != null ? `Graded: ${mySubmission.marksObtained}/${a.maxMarks}` : 'Submitted'}
                  </span>
                ) : (
                  <button onClick={() => submit(a.id)} className="btn-primary !py-2 !px-4 text-sm">
                    Submit
                  </button>
                )}
              </div>
              {mySubmission?.feedback && (
                <div className="mt-4 pt-3 border-t border-line">
                  <p className="text-xs font-mono text-muted uppercase tracking-wide mb-1">Feedback</p>
                  <p className="text-sm text-muted">{mySubmission.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-muted">No assignments posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
