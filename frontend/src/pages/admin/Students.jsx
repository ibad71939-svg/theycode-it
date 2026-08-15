import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

export default function Students() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [loaded, setLoaded] = useState(false);

  function load() {
    if (!token) return;

    api
      .get(`/admin/students?page=${page}&limit=20`, token)
      .then((res) => {
        setStudents(res.data);
        setMeta({ totalPages: res.totalPages, total: res.total });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    load();
  }, [token, page]);

  if (!token || !loaded) {
    return <LoadingSpinner fullScreen={false} />;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">
        Students
      </h1>

      <div className="bg-white border-2 border-ink/10 rounded-admin overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-ink text-white text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Enrollments</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-muted/10">
                  <td className="px-4 py-3 font-medium">
                    {s.user?.name}
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {s.user?.email}
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {s.enrollments
                      ?.map((e) => e.batch?.course?.title)
                      .join(', ') || '—'}
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-muted"
                  >
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
      </div>
    </div>
  );
}