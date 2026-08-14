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
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">My Courses</h1>
      <div className="space-y-6">
        {enrollments.map((e) => (
          <div key={e.id} className="bg-white border border-muted/10 rounded-card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-lg">{e.batch?.course?.title}</h3>
                <p className="text-sm text-muted">Instructor: {e.batch?.instructor?.user?.name || 'TBA'}</p>
              </div>
              {e.certificate && (
                <a href={e.certificate.certificateUrl || '#'} className="text-sm font-semibold text-brand-dark bg-brand-tint px-3 py-1.5 rounded-card">
                  Download Certificate
                </a>
              )}
            </div>
            <div className="mt-5">
              <ProgressThread steps={STAGE_STEPS} currentIndex={stageIndex(e.status)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
              <div>
                <p className="text-muted">Attendance sessions logged</p>
                <p className="font-semibold">{e.attendance?.length || 0}</p>
              </div>
              <div>
                <p className="text-muted">Grades recorded</p>
                <p className="font-semibold">{e.grades?.length || 0}</p>
              </div>
            </div>
          </div>
        ))}
        {enrollments.length === 0 && <p className="text-muted">No courses yet.</p>}
      </div>
    </div>
  );
}
