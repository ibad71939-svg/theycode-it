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
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Assignments</h1>
      {status && <p className="text-brand-dark text-sm mb-4">{status}</p>}
      <div className="space-y-4">
        {assignments.map((a) => {
          const mySubmission = a.submissions?.[0];
          return (
            <div key={a.id} className="bg-white border border-muted/10 rounded-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-muted mt-1">{a.description}</p>
                  <p className="text-xs text-muted mt-2">Due {new Date(a.dueDate).toLocaleDateString()} · Max marks {a.maxMarks}</p>
                </div>
                {mySubmission ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-tint text-brand-dark">
                    {mySubmission.marksObtained != null ? `Graded: ${mySubmission.marksObtained}/${a.maxMarks}` : 'Submitted'}
                  </span>
                ) : (
                  <button onClick={() => submit(a.id)} className="text-sm font-semibold bg-brand text-white px-4 py-2 rounded-card hover:bg-brand-dark">
                    Submit
                  </button>
                )}
              </div>
              {mySubmission?.feedback && (
                <p className="text-sm text-muted mt-3 border-t border-muted/10 pt-3">Feedback: {mySubmission.feedback}</p>
              )}
            </div>
          );
        })}
        {assignments.length === 0 && <p className="text-muted">No assignments posted yet.</p>}
      </div>
    </div>
  );
}