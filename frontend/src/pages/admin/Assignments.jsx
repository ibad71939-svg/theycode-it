import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';
import LoadingSpinner from '../../components/LoadingSpinner';

const empty = { title: '', description: '', batchId: '', dueDate: '', maxMarks: 100 };

export default function Assignments() {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [loaded, setLoaded] = useState(false);

  function load() {
    if (!token) return;
    Promise.all([
      api.get('/admin/assignments', token).then(setList).catch(() => {}),
      api.get('/admin/batches', token).then(setBatches).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }
  useEffect(load, [token]);

  async function create(e) {
    e.preventDefault();
    if (!form.batchId) return;
    await api.post('/admin/assignments', { ...form, maxMarks: Number(form.maxMarks) }, token);
    setForm(empty);
    load();
  }

  function batchLabel(b) {
    return `${b.course?.title || 'Course'} — ${b.schedule || ''}`;
  }

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Assignments</h1>

      <form onSubmit={create} className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-5 mb-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Batch" required>
            <select name="batchId" required className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
              value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}>
              <option value="">Select a batch…</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{batchLabel(b)}</option>)}
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Title" required>
            <input name="title" required placeholder="Title" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description" required>
            <textarea name="description" required placeholder="Description" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <Field label="Due date">
          <input name="dueDate" type="date" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Field>
        <Field label="Max marks">
          <input name="maxMarks" type="number" placeholder="Max marks" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
        </Field>
        <button className="bg-brand text-white font-semibold rounded-admin py-2 sm:col-span-2 hover:bg-brand-dark">
          Create Assignment
        </button>
      </form>

      <div className="space-y-3">
        {list.map((a) => (
          <div key={a.id} className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-4">
            <p className="font-semibold">{a.title}</p>
            <p className="text-sm text-muted mt-1">{a.description}</p>
            <p className="text-xs text-muted mt-2">
              Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'} · Max marks {a.maxMarks || '—'}
            </p>
          </div>
        ))}
        {list.length === 0 && <p className="text-muted">No assignments created yet.</p>}
      </div>
    </div>
  );
}