import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';
import LoadingSpinner from '../../components/LoadingSpinner';

const empty = { bankName: '', accountTitle: '', accountNumber: '', iban: '', branch: '' };

export default function Settings() {
  const { token } = useAuth();
  const [form, setForm] = useState(empty);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function load() {
    if (!token) return;
    api.get('/admin/bank-details', token)
      .then((data) => setForm({ ...empty, ...data }))
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }
  useEffect(load, [token]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await api.put('/admin/bank-details', form, token);
      setForm({ ...empty, ...updated });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-2">Settings</h1>
      <p className="text-sm text-muted mb-6">
        These bank details are shown to students in the Pay Now panel when they choose Bank Transfer.
      </p>

      <form onSubmit={save} className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-5 max-w-xl space-y-3">
        <h2 className="font-display font-semibold text-lg mb-1">Bank Transfer Details</h2>

        <Field label="Bank Name" required>
          <input required placeholder="e.g. Meezan Bank" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
        </Field>
        <Field label="Account Title" required>
          <input required placeholder="e.g. They Code It (Pvt) Ltd" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.accountTitle} onChange={(e) => setForm({ ...form, accountTitle: e.target.value })} />
        </Field>
        <Field label="Account Number" required>
          <input required placeholder="e.g. 0123-4567890-1" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
        </Field>
        <Field label="IBAN" required>
          <input required placeholder="e.g. PK00 MEZN 0000 0001 2345 6789" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
        </Field>
        <Field label="Branch">
          <input placeholder="e.g. Karachi Main Branch" className="w-full border-2 border-ink/10 rounded-admin px-3 py-2"
            value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
        </Field>

        {error && <p className="text-danger text-sm">{error}</p>}
        {saved && !error && <p className="text-brand-dark text-sm font-medium">Saved — students will see the updated details.</p>}

        <div className="flex justify-end pt-1">
          <button disabled={saving} className="bg-brand text-white font-semibold px-5 py-2 rounded-admin hover:bg-brand-dark disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
