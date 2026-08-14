import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import ProgressThread from '../../components/ProgressThread';

const STAGE_STEPS = ['Registered', 'Approved', 'In Progress', 'Completed'];
function stageIndex(status) {
  return { PENDING: 0, APPROVED: 1, ACTIVE: 2, COMPLETED: 3, REJECTED: 0 }[status] ?? 0;
}

export default function MyCourses() {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get('/student/enrollments', token).then(setEnrollments).catch(() => {});
  }, [token]);

  return (
    <div className="animate-fade-up">
      <p className="section-eyebrow mb-2">Student Portal</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">My Courses</h1>
      <div className="space-y-6">
        {enrollments.map((e) => (
          <div key={e.id} className="card p-6 hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="font-display font-bold text-lg">{e.batch?.course?.title}</h3>
                <p className="text-sm text-muted mt-1">Instructor: {e.batch?.instructor?.user?.name || 'TBA'}</p>
                <p className="text-sm text-muted">{e.batch?.schedule}</p>
              </div>
              {e.certificate ? (
                <a href={e.certificate.certificateUrl || '#'} className="btn-accent !py-2 !px-4 text-sm">
                  Download Certificate
                </a>
              ) : (
                <span className={`pill ${
                  e.status === 'APPROVED' || e.status === 'ACTIVE' ? 'bg-mint-50 text-mint-700' :
                  e.status === 'REJECTED' ? 'bg-danger-50 text-danger' :
                  'bg-warn-50 text-warn'
                }`}>{e.status}</span>
              )}
            </div>
            <ProgressThread steps={STAGE_STEPS} currentIndex={stageIndex(e.status)} />
            <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
              <div className="bg-surface rounded-card p-3">
                <p className="text-muted text-xs font-mono uppercase tracking-wide">Attendance sessions</p>
                <p className="font-display font-bold text-lg mt-1">{e.attendance?.length || 0}</p>
              </div>
              <div className="bg-surface rounded-card p-3">
                <p className="text-muted text-xs font-mono uppercase tracking-wide">Grades recorded</p>
                <p className="font-display font-bold text-lg mt-1">{e.grades?.length || 0}</p>
              </div>
            </div>
          </div>
        ))}
        {enrollments.length === 0 && <p className="text-muted">No courses yet.</p>}
      </div>
    </div>
  );
}
