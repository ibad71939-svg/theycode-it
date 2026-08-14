import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Students() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!token) return;
    api.get('/admin/students', token).then(setStudents).catch(() => {});
  }, [token]);

  if (!token) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Students</h1>
      <div className="bg-white border border-muted/10 rounded-admin overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Enrollments</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-muted/10">
                <td className="px-4 py-3 font-medium">{s.user?.name}</td>
                <td className="px-4 py-3 text-muted">{s.user?.email}</td>
                <td className="px-4 py-3 text-muted">
                  {s.enrollments.map((e) => e.batch?.course?.title).join(', ') || '—'}
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-muted">No students yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
