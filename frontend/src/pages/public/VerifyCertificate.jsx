import { useState } from 'react';
import { api } from '../../lib/api';
import Field from '../../components/Field';

export default function VerifyCertificate() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleVerify(e) {
    e.preventDefault();
    setError(''); setResult(null);
    try {
      const data = await api.get(`/courses/certificates/verify/${encodeURIComponent(code)}`);
      setResult(data);
    } catch (e) {
      setError('No certificate found for that code.');
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <p className="kicker mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
        Records
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Verify a Certificate</h1>
      <p className="text-muted mb-8">Enter the verification code printed on a They Code It certificate.</p>

      <form onSubmit={handleVerify} className="flex gap-3 items-end">
        <div className="flex-1">
          <Field label="Verification code">
            <input
              name="verificationCode"
              placeholder="e.g. TCI-AB12CD34"
              className="field-input font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>
        </div>
        <button className="btn-primary !py-2.5">Verify</button>
      </form>

      {error && <p className="text-danger text-sm mt-4">{error}</p>}
      {result && (
        <div className="mt-6 card border-mint/30 p-6 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-mint" />
          <p className="text-sm text-mint-dark font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-mint-tint flex items-center justify-center text-xs">✓</span>
            Valid Certificate
          </p>
          <p className="mt-3 font-display font-semibold text-lg">{result.studentName}</p>
          <p className="text-muted text-sm">{result.course}</p>
          <p className="text-xs text-muted mt-2 font-mono">Issued {new Date(result.issuedAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
