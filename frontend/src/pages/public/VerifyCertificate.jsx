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
    <div>
      <section className="gradient-mesh border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <span className="kicker mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
            Records
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Verify a Certificate</h1>
          <p className="text-muted text-lg max-w-xl">Enter the verification code printed on a They Code It certificate to confirm its authenticity.</p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
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
          <div className="mt-6 card border-mint-300 p-8 relative overflow-hidden animate-scale-in">
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-mint" />
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-mint-50 text-mint flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.53-9.72a.75.75 0 00-1.06-1.06L9 10.69 7.53 9.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4-4Z" clipRule="evenodd" /></svg>
              </span>
              <p className="text-sm text-mint-700 font-bold uppercase tracking-wide">Valid Certificate</p>
            </div>
            <p className="font-display font-bold text-xl">{result.studentName}</p>
            <p className="text-muted text-sm mt-1">{result.course}</p>
            <p className="text-xs text-muted mt-3 font-mono">Issued {new Date(result.issuedAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
