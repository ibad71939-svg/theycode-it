import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';
import LoadingSpinner from '../../components/LoadingSpinner';

const empty = { title: '', body: '', audience: 'all' };

export default function Announcements() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [loaded, setLoaded] = useState(false);

  function load() {
    if (!token) return;
    api.get('/admin/announcements', token).then(setList).catch(() => {}).finally(() => setLoaded(true));
  }
  useEffect(load, [token]);

  async function create(e) {
    e.preventDefault();
    if (!form.title || !form.body) return;
    await api.post('/admin/announcements', form, token);
    setForm(empty);
    load();
  }

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Announcements</h1>

      <form onSubmit={create} className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-5 mb-6 space-y-3">
        <Field label="Title" required>
          <input name="title" required placeholder="Title" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Message" required>
          <textarea name="body" required placeholder="Message" rows={3} className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </Field>
        <div className="flex justify-between items-end">
          <Field label="Audience">
            <select name="audience" className="border-2 border-ink/10 rounded-admin px-3 py-2 text-sm"
              value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="students">Students only</option>
            </select>
          </Field>
          <button className="bg-brand text-white font-semibold px-5 py-2 rounded-admin hover:bg-brand-dark">Publish</button>
        </div>
      </form>

      <div className="space-y-3">
        {list.map((a) => (
          <div key={a.id} className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-4">
            <div className="flex justify-between items-start">
              <p className="font-semibold">{a.title}</p>
              <span className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-muted mt-1">{a.body}</p>
            <span className="inline-block mt-2 text-xs font-medium text-brand-dark bg-brand-tint px-2 py-0.5 rounded-full capitalize">
              {a.audience}
            </span>
          </div>
        ))}
        {list.length === 0 && <p className="text-muted">No announcements yet.</p>}
      </div>
    </div>
  );
}