import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';
import LoadingSpinner from '../../components/LoadingSpinner';

const empty = { name: '', email: '', phone: '', bio: '', specialization: '' };

export default function Instructors() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null); // { name, email, tempPassword }

  function load() {
    if (!token) return;
    api.get('/admin/instructors', token).then(setList).catch(() => {});
  }
  useEffect(load, [token]);

  if (!token) return <LoadingSpinner fullScreen={false} />;

  async function create(e) {
    e.preventDefault();
    setError('');
    try {
      const result = await api.post('/admin/instructors', form, token);
      setCreated({ name: form.name, email: form.email, tempPassword: result.tempPassword });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Instructors</h1>

      {created && (
        <div className="bg-brand-tint border border-brand/30 rounded-admin p-4 mb-6 text-sm">
          <p className="font-semibold text-brand-dark">Account created for {created.name}</p>
          <p className="mt-1">Share this one-time password securely — it won't be shown again:</p>
          <p className="font-mono bg-white border border-muted/20 rounded px-3 py-1.5 mt-2 inline-block">{created.tempPassword}</p>
          <button onClick={() => setCreated(null)} className="block mt-2 text-xs text-muted hover:text-ink">Dismiss</button>
        </div>
      )}

      <form onSubmit={create} className="bg-white border border-muted/10 rounded-admin p-5 mb-6 grid sm:grid-cols-2 gap-4">
        <Field label="Full name" required>
          <input name="name" required placeholder="Full name" className="w-full border border-muted/20 rounded-admin px-3 py-2"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email" required>
          <input name="email" required type="email" placeholder="Email" className="w-full border border-muted/20 rounded-admin px-3 py-2"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input name="phone" placeholder="Phone" className="w-full border border-muted/20 rounded-admin px-3 py-2"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Specialization">
          <input name="specialization" placeholder="Specialization (e.g. Web Development)" className="w-full border border-muted/20 rounded-admin px-3 py-2"
            value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Short bio">
            <textarea name="bio" placeholder="Short bio" className="w-full border border-muted/20 rounded-admin px-3 py-2"
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>
        </div>
        {error && <p className="text-danger text-sm sm:col-span-2">{error}</p>}
        <button className="bg-brand text-white font-semibold rounded-admin py-2 sm:col-span-2 hover:bg-brand-dark">
          Create Instructor Account
        </button>
      </form>

      <div className="bg-white border border-muted/10 rounded-admin overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Specialization</th>
              <th className="px-4 py-3 font-medium">Batches</th>
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-t border-muted/10">
                <td className="px-4 py-3 font-medium">{i.user?.name}</td>
                <td className="px-4 py-3 text-muted">{i.specialization || '—'}</td>
                <td className="px-4 py-3 text-muted">{i.batches?.length || 0}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-muted">No instructors yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}