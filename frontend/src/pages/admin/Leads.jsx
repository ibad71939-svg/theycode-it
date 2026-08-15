import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const STAGES = ['NEW', 'CONTACTED', 'CONVERTED'];

export default function Leads() {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loaded, setLoaded] = useState(false);

  function load() {
    if (!token) return;
    api.get('/admin/leads', token).then(setLeads).catch(() => {}).finally(() => setLoaded(true));
  }
  useEffect(load, [token]);

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  async function moveStage(id, status) {
    await api.put(`/admin/leads/${id}`, { status }, token);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Leads / CRM</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {STAGES.map((stage) => (
          <div key={stage} className="bg-brand-50 border-2 border-brand-100 rounded-admin p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 px-1">{stage}</p>
            <div className="space-y-3">
              {leads.filter((l) => l.status === stage).map((l) => (
                <div key={l.id} className="bg-white border-2 border-ink/10 rounded-admin shadow-card p-3">
                  <p className="font-medium text-sm">{l.name}</p>
                  <p className="text-xs text-muted">{l.email}</p>
                  {l.courseInterest && <p className="text-xs text-brand-dark mt-1">Interested: {l.courseInterest}</p>}
                  {l.message && <p className="text-xs text-muted mt-1 line-clamp-2">{l.message}</p>}
                  <div className="flex gap-2 mt-2">
                    {STAGES.filter((s) => s !== stage).map((s) => (
                      <button key={s} onClick={() => moveStage(l.id, s)} className="text-xs font-medium text-brand-dark hover:underline">
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {leads.filter((l) => l.status === stage).length === 0 && (
                <p className="text-xs text-muted px-1">No leads here.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}