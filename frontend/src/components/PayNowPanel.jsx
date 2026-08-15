import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ACCEPTED = 'image/png,image/jpeg,image/webp,application/pdf';
const MAX_BYTES = 5 * 1024 * 1024;

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-ink/10 last:border-0">
      <span className="text-xs text-muted uppercase tracking-wide font-mono">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}

export default function PayNowPanel({ payment, onUpdated }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  // 'choose' | 'cash' | 'bank_transfer' — starts on whatever method was
  // already picked (or the picker, if none chosen yet).
  const [view, setView] = useState(payment.method === 'cash' || payment.method === 'bank_transfer' ? payment.method : 'choose');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [settingMethod, setSettingMethod] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [bankError, setBankError] = useState('');

  // Bank details now live in the admin-editable settings table instead of
  // being hardcoded — fetch them once the panel is open so the Bank
  // Transfer view always shows whatever the admin last saved.
  useEffect(() => {
    if (!open || !token) return;
    let cancelled = false;
    api.get('/student/bank-details', token)
      .then((data) => { if (!cancelled) setBankDetails(data); })
      .catch((e) => { if (!cancelled) setBankError(e.message); });
    return () => { cancelled = true; };
  }, [open, token]);

  async function chooseMethod(method) {
    setError('');
    setSettingMethod(true);
    try {
      const updated = await api.put(`/student/payments/${payment.id}/method`, { method }, token);
      onUpdated?.(updated);
      setView(method);
    } catch (e) {
      setError(e.message);
    } finally {
      setSettingMethod(false);
    }
  }

  function handleFileChange(e) {
    setError('');
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    if (f.size > MAX_BYTES) {
      setError('File is too large — please upload something under 5MB.');
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleUpload() {
    if (!file) { setError('Please choose a screenshot or PDF of your payment first.'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const updated = await api.upload(`/student/payments/${payment.id}/receipt`, formData, token);
      onUpdated?.(updated);
      setFile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleViewReceipt() {
    setViewLoading(true);
    try {
      const { url } = await api.get(`/student/payments/${payment.id}/receipt-url`, token);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e.message);
    } finally {
      setViewLoading(false);
    }
  }

  if (payment.status === 'PAID') return null;

  return (
    <div className="mt-2">
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary text-sm px-4 py-2">
          {payment.method ? 'View / Update Payment' : 'Pay Now'}
        </button>
      ) : (
        <div className="card-tint p-5 mt-2 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-display font-bold text-lg">Rs {payment.amount?.toLocaleString()}</p>
              <p className="text-xs text-muted">Choose how you'd like to pay</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs text-muted hover:text-ink">Close</button>
          </div>

          {view === 'choose' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => chooseMethod('cash')}
                disabled={settingMethod}
                className="bg-white border-2 border-ink/10 rounded-lg p-4 text-left hover:border-brand transition disabled:opacity-60"
              >
                <p className="font-semibold text-ink">Pay with Cash</p>
                <p className="text-xs text-muted mt-1">Pay in person at our campus office</p>
              </button>
              <button
                onClick={() => chooseMethod('bank_transfer')}
                disabled={settingMethod}
                className="bg-white border-2 border-ink/10 rounded-lg p-4 text-left hover:border-brand transition disabled:opacity-60"
              >
                <p className="font-semibold text-ink">Bank Transfer</p>
                <p className="text-xs text-muted mt-1">Transfer online and upload a receipt</p>
              </button>
            </div>
          )}

          {view === 'cash' && (
            <div className="bg-white rounded-lg border border-ink/10 p-4 space-y-3">
              <p className="text-sm">
                Please pay <span className="font-display font-bold">Rs {payment.amount?.toLocaleString()}</span> in cash at our campus office.
                Bring your student ID — our staff will confirm the payment and update your record.
              </p>
              <button onClick={() => setView('choose')} className="text-xs text-brand-700 font-semibold hover:underline">
                ← Choose a different method
              </button>
            </div>
          )}

          {view === 'bank_transfer' && (
            <>
              <div className="bg-white rounded-lg border border-ink/10 p-4">
                {bankDetails ? (
                  <>
                    <DetailRow label="Bank" value={bankDetails.bankName} />
                    <DetailRow label="Account Title" value={bankDetails.accountTitle} />
                    <DetailRow label="Account Number" value={bankDetails.accountNumber} />
                    <DetailRow label="IBAN" value={bankDetails.iban} />
                    {bankDetails.branch && <DetailRow label="Branch" value={bankDetails.branch} />}
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    {bankError ? 'Could not load bank details — please try again.' : 'Loading bank details…'}
                  </p>
                )}
              </div>

              {payment.receiptPath && (
                <div className="flex items-center justify-between bg-white rounded-lg border border-ink/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Receipt uploaded</p>
                    <p className="text-xs text-muted">
                      {payment.receiptUploadedAt ? new Date(payment.receiptUploadedAt).toLocaleString() : ''} — pending admin verification
                    </p>
                  </div>
                  <button onClick={handleViewReceipt} disabled={viewLoading} className="text-sm font-semibold text-brand-700 hover:underline disabled:opacity-60">
                    {viewLoading ? 'Loading…' : 'View'}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  {payment.receiptPath ? 'Upload a new screenshot to replace it' : 'Upload payment screenshot or PDF receipt'}
                </label>
                <input
                  type="file"
                  accept={ACCEPTED}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-brand file:text-white hover:file:bg-brand-700 file:cursor-pointer"
                />
                <p className="text-xs text-muted mt-1">PNG, JPG, WEBP, or PDF — max 5MB. Only you and academy staff can view this file.</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary flex-1 text-sm disabled:opacity-60">
                  {uploading ? 'Uploading…' : 'Submit Receipt'}
                </button>
                <button onClick={() => setView('choose')} className="text-xs text-brand-700 font-semibold hover:underline whitespace-nowrap">
                  Change method
                </button>
              </div>
            </>
          )}

          {error && <p className="text-danger text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
